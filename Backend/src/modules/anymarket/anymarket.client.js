const axios = require('axios');

const BASE_URL = 'https://api.anymarket.com.br/v2';

/**
 * Cria um cliente axios para a AnyMarket com o token informado.
 * @param {string} token - gumgaToken da conta
 * @returns {import('axios').AxiosInstance}
 */
function criarCliente(token) {
  const cliente = axios.create({
    baseURL: BASE_URL,
    headers: {
      'Content-Type': 'application/json',
      gumgaToken: token,
    },
    timeout: 15000,
  });

  cliente.interceptors.response.use(
    (res) => res,
    (err) => {
      const status = err.response?.status;
      const msg = err.response?.data?.message || err.message;
      const url = err.config?.url;
      console.error(`[AnyMarket] Erro ${status} em ${url}: ${msg}`);
      return Promise.reject(err);
    }
  );

  return cliente;
}

const clienteOrigem = criarCliente(process.env.ANY_1);
const clienteDestino = criarCliente(process.env.ANY_2);

/**
 * Busca produto pelo ID do hub na conta de origem.
 * @param {string|number} idProdHub
 * @returns {Promise<object>}
 */
async function getProdutoById(idProdHub) {
  const { data } = await clienteOrigem.get(`/products/${idProdHub}`);
  return data;
}

/**
 * Cria um produto na conta de origem ou destino.
 * Passe conta='destino' para duplicar entre contas diferentes.
 * @param {object} payload
 * @param {'origem'|'destino'} [conta='origem']
 * @returns {Promise<object>}
 */
async function criarProduto(payload, conta = 'origem') {
  const cliente = conta === 'destino' ? clienteDestino : clienteOrigem;
  const { data } = await cliente.post('/products', payload);
  return data;
}

module.exports = { getProdutoById, criarProduto };