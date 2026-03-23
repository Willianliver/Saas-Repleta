/**
 * @fileoverview Tipos JSDoc do módulo AnyMarket.
 * Servem como documentação e habilitam autocomplete no VSCode
 * sem necessidade de TypeScript.
 */

/**
 * @typedef {object} DuplicarProdutoParams
 * @property {string|number} idProdHub  - ID do produto de origem no hub AnyMarket
 * @property {string}        novoSku    - SKU do produto duplicado
 * @property {string}        novoEan    - EAN do produto duplicado
 */

/**
 * @typedef {object} VariacaoProduto
 * @property {string}  sku
 * @property {string}  ean
 * @property {number}  price
 * @property {number}  stock
 * @property {string}  [id]         - removido na duplicação
 * @property {string}  [createdAt]  - removido na duplicação
 */

/**
 * @typedef {object} ProdutoAnyMarket
 * @property {string}            id
 * @property {string}            sku
 * @property {string}            ean
 * @property {string}            title
 * @property {string}            description
 * @property {number}            price
 * @property {VariacaoProduto[]} [variations]
 * @property {string[]}          [images]
 * @property {object}            [category]
 * @property {string}            [createdAt]
 * @property {string}            [updatedAt]
 */

module.exports = {};