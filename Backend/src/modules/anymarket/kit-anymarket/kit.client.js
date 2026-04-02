// src/modules/anymarket/kit-anymarket/kit.client.js

const axios = require('axios');

const BASE_URL = 'https://api.anymarket.com.br/v2';

const HEADERS = {
  'Content-Type': 'application/json',
  gumgaToken: process.env.ANY_1,
};

const MAX_RETRIES = 4;
const BACKOFF_BASE_MS = 1500;
const RETRY_STATUS = new Set([429, 500, 502, 503, 504]);

/**
 * Executa uma requisição HTTP com retry automático e backoff exponencial.
 * Espelho direto de get_json_with_retries() do Python.
 *
 * @param {object} config - config axios (method, url, params, data)
 * @returns {Promise<{status: number, data: any}>}
 */
async function requestWithRetry(config, attempt = 0) {
  try {
    const res = await axios({ baseURL: BASE_URL, headers: HEADERS, timeout: 30000, ...config });
    return { status: res.status, data: res.data };
  } catch (err) {
    const status = err.response?.status;
    const retryAfter = err.response?.headers?.['retry-after'];

    if (attempt < MAX_RETRIES && (!status || RETRY_STATUS.has(status))) {
      const sleepMs = retryAfter
        ? parseFloat(retryAfter) * 1000
        : BACKOFF_BASE_MS * Math.pow(2, attempt);

      console.warn(`[AnyMarket] ${status || 'ERR'} em ${config.url} — retry em ${(sleepMs / 1000).toFixed(1)}s (tentativa ${attempt + 1}/${MAX_RETRIES})`);
      await sleep(sleepMs);
      return requestWithRetry(config, attempt + 1);
    }

    return {
      status: status || 599,
      data: err.response?.data || err.message || 'Erro após múltiplas tentativas',
    };
  }
}

/**
 * Busca produto pelo ID do hub.
 * @param {string|number} idProdHub
 */
async function getProdutoById(idProdHub) {
  return requestWithRetry({ method: 'GET', url: `/products/${idProdHub}` });
}

/**
 * Busca o idSku interno a partir do partnerId (SKU externo).
 * Equivalente a resolve_sku_id_from_partner() do Python.
 * @param {string} partnerId
 * @returns {Promise<number|null>}
 */
async function resolveSkuIdFromPartner(partnerId) {
  const { status, data } = await requestWithRetry({
    method: 'GET',
    url: '/products',
    params: { sku: String(partnerId) },
  });

  if (status !== 200 || !data?.content) {
    console.warn(`[AnyMarket] Falha ao buscar SKU ${partnerId}: HTTP ${status}`);
    return null;
  }

  for (const prod of data.content) {
    for (const sku of prod.skus || []) {
      if (String(sku.partnerId) === String(partnerId)) {
        return sku.id;
      }
    }
  }

  // Fallback: primeiro SKU do primeiro produto
  return data.content[0]?.skus?.[0]?.id ?? null;
}

/**
 * Busca o preço do SKU no estoque definido.
 * Equivalente a fetch_price_from_stocks() do Python.
 * @param {string} skuPartner
 * @param {number} stockLocalId
 * @returns {Promise<number>}
 */
async function fetchPriceFromStocks(skuPartner, stockLocalId) {
  const { status, data } = await requestWithRetry({
    method: 'GET',
    url: '/stocks',
    params: { sku: skuPartner, stockLocalId },
  });

  if (status !== 200) {
    console.warn(`[AnyMarket] Falha ao buscar preço de ${skuPartner}: HTTP ${status}`);
    return 1.0;
  }

  const content = Array.isArray(data) ? data : data?.content ?? [];
  for (const item of content) {
    if (String(item.stockLocal?.id) === String(stockLocalId)) {
      return parseFloat(item.price) || 1.0;
    }
  }

  return 1.0;
}

/**
 * Cria um produto (POST /products).
 * @param {object} payload
 */
async function criarProduto(payload) {
  return requestWithRetry({ method: 'POST', url: '/products', data: payload });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = { getProdutoById, resolveSkuIdFromPartner, fetchPriceFromStocks, criarProduto, sleep };