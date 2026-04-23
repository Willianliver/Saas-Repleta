const express = require('express');
const cors = require('cors');

const app = express();

// Lê JSON do body das requisições
app.use(express.json());

app.use(cors({
  origin: 'https://saas-repleta.vercel.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(cors());

// ─── Módulos ──────────────────────────────────────────────
const anymarketRoutes = require('./modules/anymarket/anymarket.routes');
const kitRoutes = require('./modules/anymarket/kit-anymarket/kit.routes');
const caracteristicasRoutes = require('./modules/anymarket/caracteristicas/caracteristicas.routes');

const KitRoutes = require('./modules/anymarket/kit-anymarket/Kit-routes-front');
app.use('/api/kit', KitRoutes);

app.use('/anymarket', anymarketRoutes);
app.use('/anymarket/kit-anymarket', kitRoutes);
app.use('/anymarket/caracteristicas', caracteristicasRoutes);  
// ─── Rota de health check ─────────────────────────────────
app.get('/', (req, res) => {
  res.json({ status: 'ok', mensagem: 'ecommerce-hub rodando' });
});



// ─── Erro 404 ─────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ erro: 'Rota não encontrada.' });
});

module.exports = app;