// src/modules/anymarket/caracteristicas/caracteristicas.routes.js

const { Router } = require('express');
const { copiarCaracteristicas } = require('./caracteristicas.service');

const router = Router();

/**
 * POST /anymarket/caracteristicas/copiar
 *
 * Copia características de um produto de origem para um de destino.
 * O filtro por palavras-chave é opcional — sem ele copia tudo.
 *
 * Body JSON:
 * {
 *   "idOrigem":     "123456",
 *   "idDestino":    "789012",
 *   "palavrasChave": ["Cor", "Tamanho"],  // opcional — omitir para copiar tudo
 *   "conta":        "origem"              // opcional — default: "origem"
 * }
 */
router.post('/copiar', async (req, res) => {
  const { idOrigem, idDestino, palavrasChave = [], conta = 'origem' } = req.body;

  if (!idOrigem || !idDestino) {
    return res.status(400).json({
      erro: 'Campos obrigatórios ausentes.',
      obrigatorios: ['idOrigem', 'idDestino'],
    });
  }

  try {
    const resultado = await copiarCaracteristicas({ idOrigem, idDestino, palavrasChave, conta });

    if (resultado.sucesso) {
      return res.status(200).json({
        mensagem: `Características copiadas com sucesso de ${idOrigem} para ${idDestino}.`,
        log: resultado.log,
      });
    }

    return res.status(422).json({ erro: resultado.erro, detalhe: resultado.detalhe });
  } catch (err) {
    return res.status(500).json({ erro: err.message });
  }
});

/**
 * POST /anymarket/caracteristicas/copiar/lote
 *
 * Copia características de múltiplos pares de produtos.
 *
 * Body JSON:
 * {
 *   "pares": [
 *     { "idOrigem": "123456", "idDestino": "789012" },
 *     { "idOrigem": "111111", "idDestino": "222222" }
 *   ],
 *   "palavrasChave": ["Cor", "Tamanho"],  // opcional — aplica o mesmo filtro em todos os pares
 *   "conta": "origem"                     // opcional
 * }
 */
router.post('/copiar/lote', async (req, res) => {
  const { pares, palavrasChave = [], conta = 'origem' } = req.body;

  if (!Array.isArray(pares) || pares.length === 0) {
    return res.status(400).json({
      erro: '"pares" deve ser um array com ao menos um item.',
      exemplo: [{ idOrigem: '123456', idDestino: '789012' }],
    });
  }

  const resultados = [];

  for (let i = 0; i < pares.length; i++) {
    const { idOrigem, idDestino } = pares[i];
    console.log(`[Características] [${i + 1}/${pares.length}] ${idOrigem} → ${idDestino}`);

    const resultado = await copiarCaracteristicas({ idOrigem, idDestino, palavrasChave, conta });
    resultados.push({ linha: i + 1, idOrigem, idDestino, ...resultado });
  }

  const sucesso = resultados.filter((r) => r.sucesso).length;

  return res.status(200).json({
    mensagem: `Finalizado: ${sucesso}/${pares.length} produtos atualizados com sucesso.`,
    resultados,
  });
});

module.exports = router;