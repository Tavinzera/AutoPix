const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

if (!process.env.DATABASE_URL) {
  console.error('Defina DATABASE_URL (veja .env.example).');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

async function init() {
  await pool.query(fs.readFileSync(path.join(__dirname, 'db', 'schema.sql'), 'utf8'));
}

module.exports = { pool, init };
