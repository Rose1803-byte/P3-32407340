const express = require('express');
const router = express.Router();
const productRepo = require('../repositories/productRepository');
const ProductQueryBuilder = require('../services/productQueryBuilder');

// Public listing with advanced filters
router.get('/', async (req, res) => {
  try {
    const builder = new ProductQueryBuilder(req.query);
    const { where, include, limit, offset } = builder.buildAll().getResult();
    const { count, rows } = await productRepo.search({ where, include, limit, offset });
    res.status(200).json({ status: 'success', data: { products: rows, meta: { total: count, page: Math.floor(offset/limit)+1, limit } } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ status: 'error', message: 'Error interno.' });
  }
});

// Self-healing URL mounted at /p -> route path is '/:idSlug'
router.get('/:idSlug', async (req, res) => {
  try {
    const idSlug = req.params.idSlug;
    const match = idSlug.match(/^([0-9]+)-(.+)$/);
    if (!match) return res.status(400).json({ status: 'fail', data: { message: 'Formato inválido. Use /p/:id-:slug' } });
    const id = parseInt(match[1]);
    const providedSlug = match[2];
    const product = await productRepo.getById(id);
    if (!product) return res.status(404).json({ status: 'fail', data: { message: 'Producto no encontrado.' } });
    if (product.slug !== providedSlug) {
      const correctUrl = `/p/${product.id}-${product.slug}`;
      return res.redirect(301, correctUrl);
    }
    res.status(200).json({ status: 'success', data: { product } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ status: 'error', message: 'Error interno.' });
  }
});

module.exports = router;
