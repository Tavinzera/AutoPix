require('dotenv').config();
const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
const { pool, init } = require('./db');

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || '';
const isProd = process.env.NODE_ENV === 'production';
if (JWT_SECRET.length < 32) {
  console.error('Defina JWT_SECRET com pelo menos 32 caracteres (veja .env.example).');
  process.exit(1);
}

const COOKIE = 'autopix_token';
const TIPOS = ['CPF', 'CNPJ', 'EMAIL', 'PHONE', 'EVP'];
const DIAS = [5, 10, 15, 20, 25, 30];
const DUMMY_HASH = bcrypt.hashSync('dummy-password', 10);

const app = express();
app.disable('x-powered-by');
if (isProd) app.set('trust proxy', 1);
app.use((req, res, next) => {
  res.set({ 'X-Content-Type-Options': 'nosniff', 'X-Frame-Options': 'DENY', 'Referrer-Policy': 'no-referrer' });
  if (req.path.startsWith('/api')) res.set('Cache-Control', 'no-store');
  next();
});
app.use(express.json({ limit: '5mb' }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
const bad = (msg, status = 400) => Object.assign(new Error(msg), { status });
const str = (v, max, min = 0) => typeof v === 'string' && v.length >= min && v.length <= max;
const cookieOpts = { httpOnly: true, sameSite: 'lax', secure: isProd };

/* ---------- validação e mapeamento ---------- */
const idOk = (id) => typeof id === 'string' && /^[\w-]{1,40}$/.test(id);

function lerChave(b) {
  if (!b || typeof b !== 'object') throw bad('Dados inválidos.');
  if (!idOk(b.id)) throw bad('ID inválido.');
  if (!TIPOS.includes(b.tipo)) throw bad('Tipo de chave inválido.');
  if (!str(b.identificacao, 60, 1) || !str(b.nomePix, 60, 1) || !str(b.chave, 100, 1))
    throw bad('Preencha identificação, nome e chave.');
  return { id: b.id, identificacao: b.identificacao.trim(), tipo: b.tipo, nomePix: b.nomePix.trim(), chave: b.chave.trim() };
}
const chaveOut = (r) => ({ id: r.id, identificacao: r.identificacao, tipo: r.tipo, nomePix: r.nome_pix, chave: r.chave, cidade: r.cidade, uf: r.uf });

function lerPag(b) {
  if (!b || typeof b !== 'object') throw bad('Dados inválidos.');
  if (!idOk(b.id)) throw bad('ID inválido.');
  if (!str(b.aluno, 2500, 1)) throw bad('Nome do aluno inválido.');
  const valor = String(b.valor);
  if (!/^\d{1,10}(\.\d{1,2})?$/.test(valor) || Number(valor) <= 0) throw bad('Valor inválido.');
  if (!str(b.code, 600, 10) || !b.code.startsWith('000201')) throw bad('Código Pix inválido.');
  const criado = new Date(b.criado);
  if (isNaN(criado)) throw bad('Data inválida.');
  const pago = !!b.pago;
  const pagoEm = pago && b.pagoEm && !isNaN(new Date(b.pagoEm)) ? new Date(b.pagoEm) : null;
  const alunos = Array.isArray(b.alunos)
    ? b.alunos.slice(0, 30).map((a) => ({
        nome: String((a && a.nome) || '').slice(0, 80),
        valor: /^\d{1,10}(\.\d{1,2})?$/.test(String(a && a.valor)) ? String(a.valor) : '0.00',
      }))
    : null;
  return {
    id: b.id, aluno: b.aluno, alunos, obs: String(b.obs || '').slice(0, 200),
    categoria: ['Mensalidade', 'Outros'].includes(b.categoria) ? b.categoria : null,
    diaVenc: b.categoria === 'Mensalidade' && DIAS.includes(Number(b.diaVenc)) ? Number(b.diaVenc) : null,
    contato: String(b.contato || '').replace(/\D/g, '').slice(0, 13),
    valor, criado, pago, pagoEm,
    empresa: String(b.empresa || '').slice(0, 60), recebedor: String(b.recebedor || '').slice(0, 200), code: b.code,
  };
}
const pagOut = (r) => ({
  id: r.id, aluno: r.aluno, alunos: r.alunos, obs: r.obs, categoria: r.categoria, diaVenc: r.dia_venc,
  contato: r.contato, valor: r.valor, criado: r.criado.toISOString(), pago: r.pago,
  pagoEm: r.pago_em ? r.pago_em.toISOString() : null, empresa: r.empresa, recebedor: r.recebedor, code: r.code,
});

const SQL_PAG = `INSERT INTO pagamentos (id,aluno,alunos,obs,categoria,dia_venc,contato,valor,criado,pago,pago_em,empresa,recebedor,code,criado_por)
  VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`;
const argsPag = (p, uid) => [p.id, p.aluno, p.alunos ? JSON.stringify(p.alunos) : null, p.obs, p.categoria, p.diaVenc, p.contato, p.valor, p.criado, p.pago, p.pagoEm, p.empresa, p.recebedor, p.code, uid];
const SQL_CHAVE = `INSERT INTO chaves (id,identificacao,tipo,nome_pix,chave,criado_por) VALUES ($1,$2,$3,$4,$5,$6)`;
const argsChave = (c, uid) => [c.id, c.identificacao, c.tipo, c.nomePix, c.chave, uid];

/* ---------- login ---------- */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: true, legacyHeaders: false,
  message: { erro: 'Muitas tentativas. Aguarde alguns minutos.' },
});

app.get('/health', wrap(async (req, res) => { await pool.query('SELECT 1'); res.json({ ok: true }); }));

app.post('/api/login', loginLimiter, wrap(async (req, res) => {
  const usuario = String((req.body && req.body.usuario) || '').trim().toLowerCase().slice(0, 100);
  const senha = String((req.body && req.body.senha) || '').slice(0, 200);
  const { rows } = await pool.query('SELECT id, nome, senha_hash, ativo FROM usuarios WHERE usuario = $1', [usuario]);
  const u = rows[0];
  const ok = await bcrypt.compare(senha, u ? u.senha_hash : DUMMY_HASH);
  if (!u || !u.ativo || !ok) return res.status(401).json({ erro: 'Usuário ou senha incorretos.' });
  const token = jwt.sign({ uid: u.id }, JWT_SECRET, { expiresIn: '12h', algorithm: 'HS256' });
  res.cookie(COOKIE, token, { ...cookieOpts, maxAge: 12 * 3600 * 1000 });
  res.json({ nome: u.nome });
}));

app.post('/api/logout', (req, res) => { res.clearCookie(COOKIE, cookieOpts); res.json({ ok: true }); });

const auth = wrap(async (req, res, next) => {
  const t = req.cookies[COOKIE];
  if (!t) return res.status(401).json({ erro: 'Não autenticado.' });
  let p;
  try { p = jwt.verify(t, JWT_SECRET, { algorithms: ['HS256'] }); }
  catch (e) { return res.status(401).json({ erro: 'Sessão expirada. Entre novamente.' }); }
  const { rows } = await pool.query('SELECT id, nome FROM usuarios WHERE id = $1 AND ativo', [p.uid]);
  if (!rows[0]) return res.status(401).json({ erro: 'Usuário desativado.' });
  req.user = rows[0];
  next();
});
app.use('/api', auth);

app.get('/api/me', (req, res) => res.json({ nome: req.user.nome }));

/* ---------- dados ---------- */
app.get('/api/dados', wrap(async (req, res) => {
  const [c, p] = await Promise.all([
    pool.query('SELECT * FROM chaves ORDER BY criado_em'),
    pool.query('SELECT * FROM pagamentos ORDER BY criado DESC'),
  ]);
  res.json({ chaves: c.rows.map(chaveOut), pagamentos: p.rows.map(pagOut) });
}));

app.post('/api/chaves', wrap(async (req, res) => {
  const c = lerChave(req.body);
  await pool.query(SQL_CHAVE, argsChave(c, req.user.id));
  const { rows } = await pool.query('SELECT * FROM chaves WHERE id = $1', [c.id]);
  res.status(201).json(chaveOut(rows[0]));
}));

app.put('/api/chaves/:id', wrap(async (req, res) => {
  const c = lerChave({ ...req.body, id: req.params.id });
  const { rows } = await pool.query(
    'UPDATE chaves SET identificacao=$1, tipo=$2, nome_pix=$3, chave=$4 WHERE id=$5 RETURNING *',
    [c.identificacao, c.tipo, c.nomePix, c.chave, c.id]);
  if (!rows[0]) throw bad('Chave não encontrada.', 404);
  res.json(chaveOut(rows[0]));
}));

app.delete('/api/chaves/:id', wrap(async (req, res) => {
  await pool.query('DELETE FROM chaves WHERE id = $1', [req.params.id]);
  res.json({ ok: true });
}));

app.post('/api/pagamentos', wrap(async (req, res) => {
  const p = lerPag(req.body);
  await pool.query(SQL_PAG, argsPag(p, req.user.id));
  const { rows } = await pool.query('SELECT * FROM pagamentos WHERE id = $1', [p.id]);
  res.status(201).json(pagOut(rows[0]));
}));

app.patch('/api/pagamentos/:id', wrap(async (req, res) => {
  const pago = !!(req.body && req.body.pago);
  let pagoEm = null;
  if (pago) {
    pagoEm = req.body.pagoEm ? new Date(req.body.pagoEm) : new Date();
    if (isNaN(pagoEm)) throw bad('Data inválida.');
  }
  const { rows } = await pool.query('UPDATE pagamentos SET pago=$1, pago_em=$2 WHERE id=$3 RETURNING *', [pago, pagoEm, req.params.id]);
  if (!rows[0]) throw bad('Pagamento não encontrado.', 404);
  res.json(pagOut(rows[0]));
}));

app.delete('/api/pagamentos/:id', wrap(async (req, res) => {
  await pool.query('DELETE FROM pagamentos WHERE id = $1', [req.params.id]);
  res.json({ ok: true });
}));

app.post('/api/importar', wrap(async (req, res) => {
  const cs = Array.isArray(req.body && req.body.chaves) ? req.body.chaves.slice(0, 5000) : [];
  const ps = Array.isArray(req.body && req.body.pagamentos) ? req.body.pagamentos.slice(0, 5000) : [];
  const chaves = cs.map(lerChave), pags = ps.map(lerPag);
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const c of chaves) await client.query(SQL_CHAVE + ' ON CONFLICT (id) DO NOTHING', argsChave(c, req.user.id));
    for (const p of pags) await client.query(SQL_PAG + ' ON CONFLICT (id) DO NOTHING', argsPag(p, req.user.id));
    await client.query('COMMIT');
  } catch (e) { await client.query('ROLLBACK'); throw e; }
  finally { client.release(); }
  res.json({ chaves: chaves.length, pagamentos: pags.length });
}));

/* ---------- erros ---------- */
app.use('/api', (req, res) => res.status(404).json({ erro: 'Rota não encontrada.' }));
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') return res.status(400).json({ erro: 'JSON inválido.' });
  if (err.type === 'entity.too.large') return res.status(413).json({ erro: 'Arquivo muito grande.' });
  if (err.code === '23505') return res.status(409).json({ erro: 'Este registro já existe.' });
  if (err.status && err.status < 500) return res.status(err.status).json({ erro: err.message });
  console.error(err);
  res.status(500).json({ erro: 'Erro interno no servidor.' });
});

/* ---------- início ---------- */
async function seedAdmin() {
  const u = (process.env.ADMIN_USER || '').trim().toLowerCase(), s = process.env.ADMIN_PASS || '';
  if (!u || !s) return;
  const { rows } = await pool.query('SELECT 1 FROM usuarios LIMIT 1');
  if (rows.length) return;
  if (s.length < 8) return console.warn('ADMIN_PASS precisa ter 8+ caracteres; usuário inicial não criado.');
  await pool.query('INSERT INTO usuarios (usuario, nome, senha_hash) VALUES ($1,$2,$3)', [u, u, await bcrypt.hash(s, 12)]);
  console.log('Usuário inicial criado:', u);
}

init().then(seedAdmin)
  .then(() => app.listen(PORT, () => console.log('AutoPix rodando na porta ' + PORT)))
  .catch((e) => { console.error('Falha ao iniciar:', e.message); process.exit(1); });
