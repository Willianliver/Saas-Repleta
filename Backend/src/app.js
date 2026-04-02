const express = require('express');
const app = express();

// Lê JSON do body das requisições
app.use(express.json());

// ─── Módulos ──────────────────────────────────────────────
const anymarketRoutes = require('./modules/anymarket/anymarket.routes');
const kitRoutes = require('./modules/anymarket/kit-anymarket/kit.routes');


app.use('/anymarket', anymarketRoutes);
app.use('/anymarket/kit-anymarket', kitRoutes);

// ─── Rota de health check ─────────────────────────────────
app.get('/', (req, res) => {
  res.json({ status: 'ok', mensagem: 'ecommerce-hub rodando' });
});

// ─── Erro 404 ─────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ erro: 'Rota não encontrada.' });
});

module.exports = app;