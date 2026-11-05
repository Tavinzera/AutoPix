# AutoPix (Node + Express + PostgreSQL)

## Rodar no seu computador
1. Crie o banco: `createdb autopix`
2. `cp .env.example .env` e edite (DATABASE_URL, JWT_SECRET, ADMIN_USER, ADMIN_PASS).
   Gerar JWT_SECRET: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`
3. `npm install` e depois `npm start`
4. Abra http://localhost:3000 — as tabelas são criadas sozinhas na primeira execução e o ADMIN_USER/ADMIN_PASS vira o primeiro usuário.

## Adicionar os outros usuários (até 5 pessoas)
`npm run criar-usuario -- maria "SenhaForte123" "Maria Silva"`
(rodar de novo com o mesmo usuário troca a senha). Para desativar alguém:
`UPDATE usuarios SET ativo = false WHERE usuario = 'maria';`

## Publicar (exemplo: Render, Railway ou similar)
- Crie um PostgreSQL no provedor e um Web Service apontando para este repositório.
- Build: `npm install` · Start: `npm start`
- Variáveis: `DATABASE_URL`, `JWT_SECRET`, `ADMIN_USER`, `ADMIN_PASS`, `NODE_ENV=production`
  (e `DATABASE_SSL=true` se o provedor exigir SSL).
- O link de pagamento usa o endereço do próprio site automaticamente (precisa de https).

## Levar os dados do app antigo
No app antigo: Chaves Pix → Exportar backup. No novo (logado): Chaves Pix → Importar backup.

## Backup
Ative os backups automáticos do banco no provedor ou use `pg_dump`.
