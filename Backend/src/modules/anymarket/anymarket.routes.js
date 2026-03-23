const { Router } = require('express');
const { duplicarSimples, duplicarComVariacoes } = require('./anymarket.service');

const router = Router();

/**
 * POST /anymarket/duplicar/simples
 *
 * Body:
 * {
 *   "idProdHub": "123456",
 *   "novoSku":   "PROD-001",
 *   "novoEan":   "7891234567890",
 *   "conta":     "origem"        // opcional, default: "origem"
 * }
 */
router.post('/duplicar/simples', async (req, res) => {
  const { idProdHub, novoSku, novoEan, conta } = req.body;

  if (!idProdHub || !novoSku || !novoEan) {
    return res.status(400).json({
      erro: 'Campos obrigatórios ausentes.',
      obrigatorios: ['idProdHub', 'novoSku', 'novoEan'],
    });
  }

  try {
    const produto = await duplicarSimples({ idProdHub, novoSku, novoEan, conta });
    return res.status(201).json({ mensagem: 'Produto simples duplicado.', produto });
  } catch (err) {
    return tratarErro(err, res);
  }
});

/**
 * POST /anymarket/duplicar/variacoes
 *
 * Body:
 * {
 *   "idProdHub":  "123456",
 *   "novoSkuPai": "PROD-PAI-001",
 *   "novoEanPai": "7891234567890",
 *   "variacoes": [
 *     { "novoSku": "PROD-VAR-001-P", "novoEan": "7891234567891" },
 *     { "novoSku": "PROD-VAR-001-M", "novoEan": "7891234567892" }
 *   ],
 *   "conta": "origem"   // opcional
 * }
 *
 * As variações devem ser enviadas na mesma ordem
 * em que aparecem no produto original.
 */
router.post('/duplicar/variacoes', async (req, res) => {
  const { idProdHub, novoSkuPai, novoEanPai, variacoes, conta } = req.body;

  if (!idProdHub || !novoSkuPai || !novoEanPai) {
    return res.status(400).json({
      erro: 'Campos obrigatórios ausentes.',
      obrigatorios: ['idProdHub', 'novoSkuPai', 'novoEanPai', 'variacoes'],
    });
  }

  if (!Array.isArray(variacoes) || variacoes.length === 0) {
    return res.status(400).json({
      erro: '"variacoes" deve ser um array com ao menos um item.',
      exemplo: [{ novoSku: 'PROD-VAR-001-P', novoEan: '7891234567891' }],
    });
  }

  try {
    const produto = await duplicarComVariacoes({
      idProdHub,
      novoSkuPai,
      novoEanPai,
      variacoes,
      conta,
    });
    return res.status(201).json({ mensagem: 'Produto com variações duplicado.', produto });
  } catch (err) {
    return tratarErro(err, res);
  }
});

/**
 * Tratamento centralizado de erros das rotas.
 * @param {Error} err
 * @param {import('express').Response} res
 */
function tratarErro(err, res) {
  if (err.response) {
    return res.status(err.response.status).json({
      erro: 'Erro retornado pela API AnyMarket.',
      detalhe: err.response.data,
    });
  }
  if (err.message) {
    return res.status(422).json({ erro: err.message });
  }
  console.error('[AnyMarket Route] Erro inesperado:', err);
  return res.status(500).json({ erro: 'Erro interno no servidor.' });
}

module.exports = router;