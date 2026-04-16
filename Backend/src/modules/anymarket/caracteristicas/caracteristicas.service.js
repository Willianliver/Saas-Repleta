// src/modules/anymarket/caracteristicas/caracteristicas.service.js

const { getClient } = require('./caracteristicas.client');

/**
 * Normaliza string para comparação — espelho do normalize_string() Python.
 * @param {string} s
 * @returns {string}
 */
function normalizar(s) {
  return s ? String(s).trim().toLowerCase() : '';
}

/**
 * Faz merge das características da origem no destino.
 * - Se a característica já existe no destino: atualiza o valor se diferente
 * - Se não existe: adiciona
 * - Retorna as características mescladas + log de alterações
 *
 * Espelho direto de merge_caracteristicas() do Python.
 *
 * @param {object[]} origem  - características do produto de referência
 * @param {object[]} destino - características do produto de destino
 * @returns {{ mergeadas: object[], log: object }}
 */
function mergeCaracteristicas(origem, destino) {
  const destinoDict = {};
  for (const c of destino) {
    destinoDict[normalizar(c.name)] = { ...c };
  }

  const log = { adicionadas: [], atualizadas: [], inalteradas: [] };

  for (const c of origem) {
    const chave = normalizar(c.name);
    const valorNovo = c.value;

    if (chave in destinoDict) {
      const valorAntigo = destinoDict[chave].value || '';
      if (normalizar(valorAntigo) !== normalizar(valorNovo)) {
        destinoDict[chave].value = valorNovo;
        log.atualizadas.push({ name: c.name, de: valorAntigo, para: valorNovo });
      } else {
        log.inalteradas.push({ name: c.name, valor: valorNovo });
      }
    } else {
      destinoDict[chave] = { ...c };
      log.adicionadas.push({ name: c.name, valor: valorNovo });
    }
  }

  return { mergeadas: Object.values(destinoDict), log };
}

/**
 * Filtra características por palavras-chave (busca parcial, case-insensitive).
 * Quando palavraChave é vazio ou não informado, retorna todas — espelho do filtro opcional do Python.
 *
 * @param {object[]} caracteristicas
 * @param {string[]} palavrasChave
 * @returns {object[]}
 */
function filtrarPorPalavrasChave(caracteristicas, palavrasChave = []) {
  if (!palavrasChave.length) return caracteristicas;
  return caracteristicas.filter((c) =>
    palavrasChave.some((p) => normalizar(c.name).includes(normalizar(p)))
  );
}

/**
 * Copia características de um produto de origem para um produto de destino.
 *
 * @param {object} params
 * @param {string|number} params.idOrigem      - ID do produto de referência
 * @param {string|number} params.idDestino     - ID do produto que receberá as características
 * @param {string[]}      [params.palavrasChave=[]] - Filtro opcional. Vazio = copia tudo
 * @param {'origem'|'destino'} [params.conta='origem']
 * @returns {Promise<{sucesso: boolean, log?: object, erro?: string}>}
 */
async function copiarCaracteristicas({ idOrigem, idDestino, palavrasChave = [], conta = 'origem' }) {
  if (!idOrigem || !idDestino) {
    throw new Error('idOrigem e idDestino são obrigatórios.');
  }

  const clienteOrigem = getClient('origem');
  const clienteDestino = getClient(conta);

  // 1. Busca produto de origem
  const { data: prodOrigem, status: stOrigem } = await clienteOrigem.get(`/products/${idOrigem}`)
    .then((r) => ({ data: r.data, status: r.status }))
    .catch((e) => ({ data: e.response?.data, status: e.response?.status || 599 }));

  if (stOrigem !== 200) {
    return { sucesso: false, erro: `Erro ao buscar produto de origem ${idOrigem}: HTTP ${stOrigem}` };
  }

  // 2. Busca produto de destino
  const { data: prodDestino, status: stDestino } = await clienteDestino.get(`/products/${idDestino}`)
    .then((r) => ({ data: r.data, status: r.status }))
    .catch((e) => ({ data: e.response?.data, status: e.response?.status || 599 }));

  if (stDestino !== 200) {
    return { sucesso: false, erro: `Erro ao buscar produto de destino ${idDestino}: HTTP ${stDestino}` };
  }

  // 3. Filtra características da origem (ou pega todas se sem filtro)
  const caracOrigem = prodOrigem.characteristics || [];
  const caracFiltradas = filtrarPorPalavrasChave(caracOrigem, palavrasChave);
  console.log(`[Características] ${idOrigem} → ${idDestino}: ${caracFiltradas.length} características encontradas`);

  // 4. Merge com as características do destino
  const caracDestino = prodDestino.characteristics || [];
  const { mergeadas, log } = mergeCaracteristicas(caracFiltradas, caracDestino);

  // 5. Atualiza produto de destino via PUT
  prodDestino.characteristics = mergeadas;

  const { status: stPut, data: dataPut } = await clienteDestino.put(`/products/${idDestino}`, prodDestino)
    .then((r) => ({ data: r.data, status: r.status }))
    .catch((e) => ({ data: e.response?.data, status: e.response?.status || 599 }));

  if (![200, 204].includes(stPut)) {
    return { sucesso: false, erro: `Erro ao atualizar produto ${idDestino}: HTTP ${stPut}`, detalhe: dataPut };
  }

  console.log(`[Características] ✅ Produto ${idDestino} atualizado.`);
  return { sucesso: true, log };
}

module.exports = { copiarCaracteristicas };