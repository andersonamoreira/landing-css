const express = require('express');
const { Pool } = require('pg');
const path    = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'static')));

const pool = new Pool({
  host:     process.env.DB_HOST     || 'db',
  port:     5432,
  database: process.env.DB_NAME     || 'css',
  user:     process.env.DB_USER     || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres123',
});

async function initDB() {
  for (let i = 0; i < 10; i++) {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS agendamentos (
          id              SERIAL PRIMARY KEY,
          nome            VARCHAR(255) NOT NULL,
          email           VARCHAR(255) NOT NULL,
          whatsapp        VARCHAR(30)  NOT NULL,
          disponibilidade TEXT         NOT NULL,
          criado_em       TIMESTAMPTZ  DEFAULT NOW()
        )
      `);
      console.log('Banco de dados pronto.');
      return;
    } catch (err) {
      console.log(`Tentativa ${i + 1}/10 — aguardando banco de dados...`);
      await new Promise(r => setTimeout(r, 3000));
    }
  }
  throw new Error('Não foi possível conectar ao banco de dados.');
}

initDB().catch(err => { console.error(err.message); process.exit(1); });

app.post('/api/agendamento', async (req, res) => {
  const { nome, email, whatsapp, disponibilidade } = req.body;

  if (!nome || !email || !whatsapp || !disponibilidade) {
    return res.status(400).json({ ok: false, error: 'Preencha todos os campos.' });
  }

  try {
    await pool.query(
      'INSERT INTO agendamentos (nome, email, whatsapp, disponibilidade) VALUES ($1, $2, $3, $4)',
      [nome, email, whatsapp, disponibilidade]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: 'Erro interno do servidor.' });
  }
});

app.listen(8080, () => console.log('Servidor rodando na porta 8080'));
