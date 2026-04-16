// GET /api/kit/:sku
router.get('/kit/:sku', async (req, res) => {
  const { sku } = req.params;
  const token = "MjU5MDYzNTc1Lg==.MUfqIGh9hJCl8gZ0ji+YXHX7aX1SucmOJntr/d0/QjNRjd8WVDk1nXie3s2dX4yf99em09OD7rCS1OYo8Ek+Mw==";

  const list = await fetch(`https://api.anymarket.com.br/v2/products?partnerId=${sku}`, {
    headers: { gumgaToken: token }
  });
  const { content } = await list.json();
  if (!content?.length) return res.status(404).json({ error: 'SKU não encontrado' });

  const prod = await fetch(`https://api.anymarket.com.br/v2/products/${content[0].id}`, {
    headers: { gumgaToken: token }
  });
  res.json(await prod.json());
});