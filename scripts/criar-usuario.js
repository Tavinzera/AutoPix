require('dotenv').config();
const bcrypt = require('bcryptjs');
const { pool, init } = require('../db');

(async () => {
  const [usuario, senha, nome] = process.argv.slice(2);
  if (!usuario || !senha || senha.length < 8) {
    console.log('Uso: npm run criar-usuario -- <usuario> "<senha com 8+ caracteres>" "<Nome>"');
    process.exit(1);
  }
  await init();
  const hash = await bcrypt.hash(senha, 12);
  await pool.query(
    `INSERT INTO usuarios (usuario, nome, senha_hash) VALUES ($1,$2,$3)
     ON CONFLICT (usuario) DO UPDATE SET senha_hash = EXCLUDED.senha_hash, nome = EXCLUDED.nome, ativo = TRUE`,
    [usuario.trim().toLowerCase(), nome || usuario, hash]
  );
  console.log('Usuário salvo:', usuario);
  await pool.end();
})().catch((e) => { console.error(e.message); process.exit(1); });
