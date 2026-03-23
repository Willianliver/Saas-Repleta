const { getProdutoById, criarProduto } = require('./anymarket.client');

// Campos que a API rejeita na criação — espelho exato do Python
const CAMPOS_REMOVIDOS_PAI = [
  'id',
  'creationDate',
  'modificationDate',
  'dataSource',
  'stockLocalId',
  'brand',
];

const CAMPOS_REMOVIDOS_SKU = ['id', 'idVariation', 'stockLocalId'];

/**
 * Remove campos internos de um objeto.
 * @param {object} obj
 * @param {string[]} campos
 * @returns {object}
 */
function removerCampos(obj, campos) {
  const limpo = { ...obj };
  campos.forEach((c) => delete limpo[c]);
  return limpo;
}

/**
 * Duplica um produto SIMPLES (sem variações).
 *
 * Equivalente Python: clonar_produto()
 *
 * @param {object} params
 * @param {string|number} params.idProdHub  - ID do produto de origem
 * @param {string}        params.novoSku    - Novo SKU (partnerId)
 * @param {string}        params.novoEan    - Novo EAN
 * @param {'origem'|'destino'} [params.conta='origem'] - Conta de destino
 * @returns {Promise<object>} produto criado
 */
async function duplicarSimples({ idProdHub, novoSku, novoEan, conta = 'origem' }) {
  if (!idProdHub || !novoSku || !novoEan) {
    throw new Error('idProdHub, novoSku e novoEan são obrigatórios.');
  }

  // 1. Busca o produto original
  let produto = await getProdutoById(idProdHub);

  // 2. Remove campos que a API rejeita
  produto = removerCampos(produto, CAMPOS_REMOVIDOS_PAI);

  // 3. Atualiza SKU principal (estrutura: produto.sku.partnerId)
  if (produto.sku && typeof produto.sku === 'object') {
    produto.sku.partnerId = novoSku;
    produto.sku.ean = novoEan;
  } else {
    produto.sku = { partnerId: novoSku, ean: novoEan };
  }

  // 4. Atualiza lista de skus, se existir
  if (Array.isArray(produto.skus)) {
    produto.skus = produto.skus.map((s) => ({
      ...s,
      partnerId: novoSku,
      ean: novoEan,
    }));
  }

  // 5. Cria o produto
  const criado = await criarProduto(produto, conta);
  console.log(`[AnyMarket] Simples duplicado. Novo ID: ${criado.id}`);
  return criado;
}

/**
 * Duplica um produto COM VARIAÇÕES (pai + skus filhos).
 *
 * Equivalente Python: clonar_produto_com_variacoes()
 *
 * Cada variação recebe seu próprio SKU e EAN, informados via
 * o array `variacoes` — substitui os inputs interativos do terminal.
 *
 * @param {object} params
 * @param {string|number} params.idProdHub    - ID do produto de origem
 * @param {string}        params.novoSkuPai   - SKU do produto pai
 * @param {string}        params.novoEanPai   - EAN do produto pai
 * @param {Array<{novoSku: string, novoEan: string}>} params.variacoes
 *   Array com SKU e EAN para cada variação, na mesma ordem retornada pela API.
 * @param {'origem'|'destino'} [params.conta='origem']
 * @returns {Promise<object>} produto criado
 */
async function duplicarComVariacoes({
  idProdHub,
  novoSkuPai,
  novoEanPai,
  variacoes,
  conta = 'origem',
}) {
  if (!idProdHub || !novoSkuPai || !novoEanPai) {
    throw new Error('idProdHub, novoSkuPai e novoEanPai são obrigatórios.');
  }

  // 1. Busca e limpa o produto
  let produto = await getProdutoById(idProdHub);
  produto = removerCampos(produto, CAMPOS_REMOVIDOS_PAI);

  // 2. Atualiza SKU pai
  if (produto.sku && typeof produto.sku === 'object') {
    produto.sku.partnerId = novoSkuPai;
    produto.sku.ean = novoEanPai;
  } else {
    produto.sku = { partnerId: novoSkuPai, ean: novoEanPai };
  }

  // 3. Processa cada SKU de variação
  if (Array.isArray(produto.skus)) {
    produto.skus = produto.skus.map((skuItem, i) => {
      // Remove campos problemáticos da variação
      let item = removerCampos(skuItem, CAMPOS_REMOVIDOS_SKU);

      // Corrige estrutura de variations: array → objeto { tipo: valor }
      // Ex: [{type: {name: 'Cor'}, description: 'Azul'}] → { Cor: 'Azul' }
      if (Array.isArray(item.variations)) {
        const variationsObj = {};
        item.variations.forEach((v) => {
          if (v.type?.name && v.description) {
            variationsObj[v.type.name] = v.description;
          }
        });
        if (Object.keys(variationsObj).length > 0) {
          item.variations = variationsObj;
        }
      }

      // Aplica SKU e EAN da variação correspondente
      const dadosVariacao = variacoes?.[i];
      if (dadosVariacao) {
        item.partnerId = dadosVariacao.novoSku;
        item.ean = dadosVariacao.novoEan;
      }

      return item;
    });
  }

  // 4. Garante flag de variações
  produto.hasVariations = true;

  // 5. Cria o produto
  const criado = await criarProduto(produto, conta);
  console.log(`[AnyMarket] Com variações duplicado. Novo ID: ${criado.id}`);
  return criado;
}

module.exports = { duplicarSimples, duplicarComVariacoes };