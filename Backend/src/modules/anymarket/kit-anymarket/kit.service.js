// src/modules/anymarket/kit-anymarket/kit.service.js

const { getProdutoById, resolveSkuIdFromPartner, fetchPriceFromStocks, criarProduto } = require('./kit.client');

const STOCK_LOCAL_ID = 45479;

// Campos removidos antes do POST — espelho exato do sanitize_product_for_post() Python
const CAMPOS_REMOVIDOS = [
  'id', 'creationDate', 'modificationDate', 'dataSource', 'stockLocalId',
  'partnerId', 'allowAutomaticSkuMarketplaceCreation', 'calculatedPrice',
  'isProductActive', 'additionalStocks', 'brand', 'kitItens', 'kitComponents',
];

/**
 * Remove campos que a API rejeita no POST.
 * @param {object} produto
 * @returns {object}
 */
function sanitizarProduto(produto) {
  const limpo = { ...produto };
  CAMPOS_REMOVIDOS.forEach((c) => delete limpo[c]);
  return limpo;
}

/**
 * Transforma um produto SIMPLES em KIT.
 *
 * Fluxo (espelho do Python):
 * 1. Busca produto original pelo idProdHub
 * 2. Sanitiza campos inválidos
 * 3. Busca preço do SKU de composição no estoque 45479
 * 4. Resolve o idSku interno do componente
 * 5. Monta skus[] e kitComponents[]
 * 6. Envia POST para criar o kit
 *
 * @param {object} params
 * @param {string|number} params.idProdHub      - ID do produto de origem
 * @param {string}        params.novoSku        - Novo SKU (partnerId) do kit
 * @param {string}        params.novoEan        - Novo EAN do kit
 * @param {string}        params.skuComposicao  - SKU do produto que compõe o kit
 * @returns {Promise<{sucesso: boolean, dados?: object, erro?: string}>}
 */
async function transformarEmKit({ idProdHub, novoSku, novoEan, skuComposicao }) {
  if (!idProdHub || !novoSku || !novoEan || !skuComposicao) {
    throw new Error('idProdHub, novoSku, novoEan e skuComposicao são obrigatórios.');
  }

  // 1. Busca produto original
  const { status: statusGet, data: produtoData } = await getProdutoById(idProdHub);
  if (statusGet !== 200 || typeof produtoData !== 'object') {
    return { sucesso: false, erro: `Erro ao buscar produto ${idProdHub}: HTTP ${statusGet}` };
  }

  // 2. Sanitiza
  const produto = sanitizarProduto({ ...produtoData });
  produto.type = 'KIT';
  produto.hasVariations = false;

  // 3. Busca preço base no estoque do SKU de composição
  let precoBase = await fetchPriceFromStocks(skuComposicao, STOCK_LOCAL_ID);
  if (precoBase <= 0) precoBase = 1.0;

  // 4. Resolve idSku interno do componente
  const idSkuComp = await resolveSkuIdFromPartner(skuComposicao);
  if (!idSkuComp) {
    return { sucesso: false, erro: `Não foi possível resolver idSku para ${skuComposicao}` };
  }

  // 5. Monta SKU do kit
  produto.skus = [{
    partnerId: String(novoSku),
    ean: String(novoEan || ''),
    title: (produto.title || '') + ' - KIT',
    active: true,
    amount: 1,
    price: precoBase,
    sellPrice: precoBase,
    stockLocalId: STOCK_LOCAL_ID,
  }];

  // 6. Monta kitComponents
  produto.kitComponents = [{
    idInClient: String(skuComposicao),
    idSku: idSkuComp,
    stockLocalId: STOCK_LOCAL_ID,
    percentage: 100,
    quantity: 1,
    isMainComponent: true,
    price: precoBase,
    priceFactor: 2.8,
  }];

  // 7. Cria o kit
  const { status: statusPost, data: dataCriado } = await criarProduto(produto);
  if (statusPost === 200 || statusPost === 201) {
    console.log(`[AnyMarket Kit] ✅ KIT criado: ${novoSku}`);
    return { sucesso: true, dados: dataCriado };
  }

  console.error(`[AnyMarket Kit] ❌ Erro criando ${novoSku}: HTTP ${statusPost}`, dataCriado);
  return { sucesso: false, erro: `HTTP ${statusPost}`, detalhe: dataCriado };
}

module.exports = { transformarEmKit };