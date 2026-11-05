CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  usuario TEXT NOT NULL UNIQUE,
  nome TEXT NOT NULL,
  senha_hash TEXT NOT NULL,
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS chaves (
  id TEXT PRIMARY KEY,
  identificacao TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('CPF','CNPJ','EMAIL','PHONE','EVP')),
  nome_pix TEXT NOT NULL,
  chave TEXT NOT NULL,
  cidade TEXT NOT NULL DEFAULT 'ITUMBIARA',
  uf TEXT NOT NULL DEFAULT 'GO',
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  criado_por INT REFERENCES usuarios(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS pagamentos (
  id TEXT PRIMARY KEY,
  aluno TEXT NOT NULL,
  alunos JSONB,
  obs TEXT NOT NULL DEFAULT '',
  categoria TEXT CHECK (categoria IN ('Mensalidade','Outros')),
  dia_venc SMALLINT,
  contato TEXT NOT NULL DEFAULT '',
  valor NUMERIC(12,2) NOT NULL CHECK (valor > 0),
  criado TIMESTAMPTZ NOT NULL,
  pago BOOLEAN NOT NULL DEFAULT FALSE,
  pago_em TIMESTAMPTZ,
  empresa TEXT NOT NULL DEFAULT '',
  recebedor TEXT NOT NULL DEFAULT '',
  code TEXT NOT NULL,
  criado_por INT REFERENCES usuarios(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS pagamentos_criado_idx ON pagamentos (criado DESC);
CREATE INDEX IF NOT EXISTS pagamentos_pago_idx ON pagamentos (pago);
