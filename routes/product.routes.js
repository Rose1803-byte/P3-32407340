const express = require('express');
const router = express.Router();
const productRepo = require('../repositories/productRepository');
const ProductQueryBuilder = require('../services/productQueryBuilder');
const { authenticateToken } = require('./auth.routes');

// Protected management endpoints
router.post('/', authenticateToken, async (req, res) => {
  try {
    const created = await productRepo.create(req.body);
    res.status(201).json({ status: 'success', data: { product: created }, message: 'Producto creado.' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ status: 'error', message: 'Error interno.' });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const product = await productRepo.getById(req.params.id);
    if (!product) return res.status(404).json({ status: 'fail', data: { message: 'Producto no encontrado.' } });
    res.status(200).json({ status: 'success', data: { product } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ status: 'error', message: 'Error interno.' });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const updated = await productRepo.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ status: 'fail', data: { message: 'Producto no encontrado.' } });
    res.status(200).json({ status: 'success', data: { product: updated }, message: 'Producto actualizado.' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ status: 'error', message: 'Error interno.' });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const ok = await productRepo.delete(req.params.id);
    if (!ok) return res.status(404).json({ status: 'fail', data: { message: 'Producto no encontrado.' } });
    res.status(200).json({ status: 'success', data: null, message: 'Producto eliminado.' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ status: 'error', message: 'Error interno.' });
  }
});

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



module.exports = router;
