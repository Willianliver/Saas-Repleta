const BASE_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, '');

async function request(path, options = {}) {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      ...options,
    });

    // tenta ler JSON mesmo em erro
    const data = await res.json().catch(() => null);

    if (!res.ok) {
      throw {
        status: res.status,
        data,
      };
    }

    return data;
  } catch (err) {
    // erro de rede (CORS, backend offline, etc)
    if (!err.status) {
      throw new Error('Erro de conexão com o servidor');
    }

    throw err;
  }
}

export const api = {
  get: (path) => request(path),
  post: (path, body) =>
    request(path, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
};

console.log('BASE_URL:', BASE_URL);