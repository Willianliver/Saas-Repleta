// src/modules/anymarket/caracteristicas/caracteristicas.client.js

const axios = require('axios');

const BASE_URL = 'https://api.anymarket.com.br/v2';

/**
 * Retorna um cliente axios configurado com o token da conta solicitada.
 * @param {'origem'|'destino'} conta
 * @returns {import('axios').AxiosInstance}
 */
function getClient(conta = 'origem') {
  const token = conta === 'destino' ? process.env.ANY_2 : process.env.ANY_1;

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
      console.error(`[AnyMarket Características] Erro ${status}: ${msg}`);
      return Promise.reject(err);
    }
  );

  return cliente;
}

module.exports = { getClient };