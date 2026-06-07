const express    = require('express');
const { Pool }   = require('pg');
const nodemailer = require('nodemailer');
const path       = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'static')));

/* ─── Banco de dados ─── */
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

/* ─── E-mail (Nodemailer / Gmail SMTP) ─── */
const transporter = nodemailer.createTransport({
  host:   'smtp.gmail.com',
  port:   587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function enviarEmail(nome, email, whatsapp, disponibilidade) {
  if (!process.env.SMTP_PASS) {
    console.log('SMTP_PASS não configurado — e-mail não enviado.');
    return;
  }
  await transporter.sendMail({
    from:    `"Site Camila Silva" <${process.env.SMTP_USER}>`,
    to:      'camilassilva.psi@gmail.com',
    subject: 'AGENDAR CONVERSA GRATUITA',
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto">
        <h2 style="color:#6D3914">Nova solicitação de conversa gratuita</h2>
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:8px 0;color:#888;width:140px">Nome</td>
              <td style="padding:8px 0;font-weight:bold">${nome}</td></tr>
          <tr><td style="padding:8px 0;color:#888">E-mail</td>
              <td style="padding:8px 0">${email}</td></tr>
          <tr><td style="padding:8px 0;color:#888">WhatsApp</td>
              <td style="padding:8px 0">${whatsapp}</td></tr>
          <tr><td style="padding:8px 0;color:#888;vertical-align:top">Disponibilidade</td>
              <td style="padding:8px 0">${disponibilidade}</td></tr>
        </table>
        <hr style="border:none;border-top:1px solid #e0d6ce;margin:24px 0">
        <p style="color:#aaa;font-size:12px">Mensagem enviada automaticamente pelo site camilassilvapsi.com.br</p>
      </div>
    `,
  });
  console.log(`E-mail enviado para camilassilva.psi@gmail.com`);
}

/* ─── Endpoint de agendamento ─── */
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

    enviarEmail(nome, email, whatsapp, disponibilidade).catch(err =>
      console.error('Falha ao enviar e-mail:', err.message)
    );

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: 'Erro interno do servidor.' });
  }
});

app.listen(8080, () => console.log('Servidor rodando na porta 8080'));
