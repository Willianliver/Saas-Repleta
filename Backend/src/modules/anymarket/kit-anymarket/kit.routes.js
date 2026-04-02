// src/modules/anymarket/kit-anymarket/kit.routes.js

const { Router } = require('express');
const busboy = require('busboy');
const ExcelJS = require('exceljs');
const { transformarEmKit } = require('./kit.service');
const { sleep } = require('./kit.client');
 
const router = Router();
 
const REQUEST_DELAY_MS = 1200;
 
/**
 * Recebe o arquivo .xlsx via busboy e retorna o buffer em memória.
 * Substitui o multer sem vulnerabilidades.
 * @param {import('express').Request} req
 * @returns {Promise<Buffer>}
 */
function receberArquivo(req) {
  return new Promise((resolve, reject) => {
    const bb = busboy({ headers: req.headers });
    const chunks = [];
 
    bb.on('file', (_fieldname, stream) => {
      stream.on('data', (chunk) => chunks.push(chunk));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', reject);
    });
 
    bb.on('error', reject);
    bb.on('finish', () => {
      if (chunks.length === 0) reject(new Error('Nenhum arquivo recebido.'));
    });
 
    req.pipe(bb);
  });
}
 
/**
 * Lê um buffer .xlsx e retorna array de objetos com as linhas.
 * Usa exceljs — sem as CVEs do SheetJS.
 * @param {Buffer} buffer
 * @returns {Promise<object[]>}
 */
async function lerPlanilha(buffer) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
 
  const sheet = workbook.worksheets[0];
  const linhas = [];
  let headers = [];
 
  sheet.eachRow((row, rowIndex) => {
    const valores = row.values.slice(1); // exceljs começa em index 1
    if (rowIndex === 1) {
      headers = valores.map((v) => String(v).trim());
    } else {
      const obj = {};
      headers.forEach((h, i) => {
        obj[h] = valores[i] !== undefined ? String(valores[i]).trim() : '';
      });
      linhas.push(obj);
    }
  });
 
  return linhas;
}
 
/**
 * POST /anymarket/kit/planilha
 *
 * Recebe um arquivo .xlsx com as colunas:
 *   id_prod_hub | novo_sku | novo_ean | sku_composicao
 *
 * Form-data:
 *   planilha: <arquivo .xlsx>
 */
router.post('/planilha', async (req, res) => {
  // 1. Recebe o arquivo
  let buffer;
  try {
    buffer = await receberArquivo(req);
  } catch (e) {
    return res.status(400).json({ erro: e.message || 'Erro ao receber arquivo.' });
  }
 
  // 2. Lê a planilha
  let linhas;
  try {
    linhas = await lerPlanilha(buffer);
  } catch (e) {
    return res.status(422).json({ erro: 'Não foi possível ler o arquivo.', detalhe: e.message });
  }
 
  if (!linhas.length) {
    return res.status(422).json({ erro: 'A planilha está vazia.' });
  }
 
  // 3. Valida colunas obrigatórias
  const obrigatorias = ['id_prod_hub', 'novo_sku', 'novo_ean', 'sku_composicao'];
  const ausentes = obrigatorias.filter((c) => !Object.keys(linhas[0]).includes(c));
  if (ausentes.length) {
    return res.status(422).json({ erro: `Colunas ausentes na planilha: ${ausentes.join(', ')}` });
  }
 
  // 4. Processa linha a linha com delay entre requisições
  const resultados = [];
  for (let i = 0; i < linhas.length; i++) {
    const { id_prod_hub, novo_sku, novo_ean, sku_composicao } = linhas[i];
 
    console.log(`[Kit] [${i + 1}/${linhas.length}] Criando KIT ${novo_sku} (origem: ${id_prod_hub}, composição: ${sku_composicao})`);
 
    const resultado = await transformarEmKit({
      idProdHub: id_prod_hub,
      novoSku: novo_sku,
      novoEan: novo_ean,
      skuComposicao: sku_composicao,
    });
 
    resultados.push({ linha: i + 1, novo_sku, ...resultado });
 
    if (i < linhas.length - 1) await sleep(REQUEST_DELAY_MS);
  }
 
  const total = resultados.length;
  const sucesso = resultados.filter((r) => r.sucesso).length;
 
  return res.status(200).json({
    mensagem: `Finalizado: ${sucesso}/${total} kits criados com sucesso.`,
    resultados,
  });
});
 
/**
 * POST /anymarket/kit/unitario
 *
 * Body JSON:
 * {
 *   "idProdHub":     "123456",
 *   "novoSku":       "KIT-001",
 *   "novoEan":       "7890000000001",
 *   "skuComposicao": "67781"
 * }
 */
router.post('/unitario', async (req, res) => {
  const { idProdHub, novoSku, novoEan, skuComposicao } = req.body;
 
  if (!idProdHub || !novoSku || !novoEan || !skuComposicao) {
    return res.status(400).json({
      erro: 'Campos obrigatórios ausentes.',
      obrigatorios: ['idProdHub', 'novoSku', 'novoEan', 'skuComposicao'],
    });
  }
 
  try {
    const resultado = await transformarEmKit({ idProdHub, novoSku, novoEan, skuComposicao });
    if (resultado.sucesso) {
      return res.status(201).json({ mensagem: 'KIT criado com sucesso.', dados: resultado.dados });
    }
    return res.status(422).json({ erro: resultado.erro, detalhe: resultado.detalhe });
  } catch (err) {
    return res.status(500).json({ erro: err.message });
  }
});
 
module.exports = router;