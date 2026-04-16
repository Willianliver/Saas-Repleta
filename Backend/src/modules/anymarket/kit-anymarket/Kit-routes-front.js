const express = require('express');
const router = express.Router();

const ANYMARKET_BASE = 'https://api.anymarket.com.br/v2';

function getHeaders() {
  return {
    'gumgaToken': process.env.ANY_1,
    'Content-Type': 'application/json',
  };
}

// GET /api/kit/:sku
router.get('/:sku', async (req, res) => {
  const searchValue = req.params.sku?.trim();

  if (!searchValue) {
    return res.status(400).json({ error: 'ID do produto ou partnerId (SKU) não informado.' });
  }

  if (!process.env.ANY_1) {
    return res.status(500).json({ error: 'Token ANY_1 não configurado no .env' });
  }

  try {
    console.log(`[AnyMarket] Buscando por: "${searchValue}"`);

    let productId = null;
    let prodData = null;

    // 1. Se for só números e grande → tenta buscar direto pelo ID do produto
    if (/^\d{7,}$/.test(searchValue)) {
      console.log(`[AnyMarket] Tentando busca direta pelo ID: ${searchValue}`);
      const directRes = await fetch(`${ANYMARKET_BASE}/products/${searchValue}`, { 
        headers: getHeaders() 
      });

      if (directRes.ok) {
        prodData = await directRes.json();
        productId = prodData.id;
        console.log(`[AnyMarket] ✅ Encontrado diretamente pelo ID`);
      }
    }

    // 2. Se ainda não encontrou → busca usando ?sku= (partnerId)
    if (!prodData) {
      console.log(`[AnyMarket] Buscando com filtro ?sku=${searchValue}`);

      const searchRes = await fetch(`${ANYMARKET_BASE}/products?sku=${encodeURIComponent(searchValue)}`, {
        headers: getHeaders()
      });

      if (!searchRes.ok) {
        const errorText = await searchRes.text().catch(() => '');
        console.error(`[AnyMarket] Erro na busca por sku: ${searchRes.status}`);
        return res.status(searchRes.status).json({ 
          error: 'Erro ao buscar produto pelo SKU', 
          detail: errorText 
        });
      }

      const searchData = await searchRes.json();
      const content = searchData.content || [];

      if (content.length === 0) {
        return res.status(404).json({ 
          error: `Nenhum produto encontrado com partnerId/SKU "${searchValue}"` 
        });
      }

      // Pega o primeiro resultado (geralmente é o único)
      productId = content[0].id;
      console.log(`[AnyMarket] ✅ Produto encontrado via ?sku= → ID: ${productId}`);

      // 3. Busca os detalhes completos do produto
      const detailRes = await fetch(`${ANYMARKET_BASE}/products/${productId}`, {
        headers: getHeaders()
      });

      if (!detailRes.ok) {
        const errorText = await detailRes.text().catch(() => '');
        return res.status(detailRes.status).json({ 
          error: 'Erro ao buscar detalhes do produto', 
          detail: errorText 
        });
      }

      prodData = await detailRes.json();
    }

    // === Monta a resposta no formato exato que o Frontend espera ===
    const matchedSku = prodData.skus?.find(s => String(s.partnerId) === String(searchValue)) 
                    || prodData.skus?.[0] 
                    || {};

    const kitComponents = (prodData.kitComponents || []).map((comp) => ({
      name: comp.name,
      idSku: comp.idSku,
      idInClient: comp.idInClient,
      quantity: Number(comp.quantity) || 1,
      percentage: Number(comp.percentage) || 0,
      price: Number(comp.price) || 0,
      subtotal: parseFloat((Number(comp.price || 0) * Number(comp.quantity || 1)).toFixed(2)),
      isMainComponent: !!comp.isMainComponent,
    }));

    const totalKitCost = (prodData.type === 'KIT' && prodData.kitComponents)
      ? parseFloat(prodData.kitComponents.reduce((sum, c) => 
          sum + Number(c.price || 0) * Number(c.quantity || 0), 0).toFixed(2))
      : 0;

    const response = {
      id: prodData.id,
      title: prodData.title,
      type: prodData.type || 'SIMPLE',
      isProductActive: !!prodData.isProductActive,
      brand: prodData.brand?.name || prodData.brand?.reducedName || null,
      category: prodData.category?.name || null,

      sku: {
        id: matchedSku.id,
        partnerId: matchedSku.partnerId,
        ean: matchedSku.ean || null,
        price: matchedSku.price || matchedSku.sellPrice,
        stockLocalId: matchedSku.stockLocalId,
        active: !!matchedSku.active,
      },

      kitComponents: kitComponents,
      totalKitCost: totalKitCost,
    };

    console.log(`[AnyMarket] Sucesso! Tipo: ${response.type} | Componentes: ${kitComponents.length}`);
    return res.json(response);

  } catch (err) {
    console.error('[kitRoutes] Erro inesperado:', err.message);
    return res.status(500).json({ 
      error: 'Erro interno do servidor ao consultar Anymarket', 
      detail: process.env.NODE_ENV === 'development' ? err.message : undefined 
    });
  }
});

module.exports = router;