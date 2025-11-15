const express = require('express');
const router = express.Router();
const { Category } = require('../models');
const { authenticateToken } = require('./auth.routes');

router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const categories = await Category.findAll();
    res.status(200).json({ status: 'success', data: { categories } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ status: 'error', message: 'Error interno.' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ status: 'fail', data: { message: 'name es requerido' } });
    const category = await Category.create({ name, description });
    res.status(201).json({ status: 'success', data: { category } });
  } catch (e) {
    if (e.name === 'SequelizeUniqueConstraintError') return res.status(409).json({ status: 'fail', data: { message: 'Categoria ya existe.' } });
    console.error(e);
    res.status(500).json({ status: 'error', message: 'Error interno.' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ status: 'fail', data: { message: 'Categoria no encontrada.' } });
    res.status(200).json({ status: 'success', data: { category } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ status: 'error', message: 'Error interno.' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ status: 'fail', data: { message: 'Categoria no encontrada.' } });
    const { name, description } = req.body;
    if (name) category.name = name;
    if (description) category.description = description;
    await category.save();
    res.status(200).json({ status: 'success', data: { category } });
  } catch (e) {
    if (e.name === 'SequelizeUniqueConstraintError') return res.status(409).json({ status: 'fail', data: { message: 'El nombre ya existe.' } });
    console.error(e);
    res.status(500).json({ status: 'error', message: 'Error interno.' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ status: 'fail', data: { message: 'Categoria no encontrada.' } });
    await category.destroy();
    res.status(200).json({ status: 'success', data: null });
  } catch (e) {
    console.error(e);
    res.status(500).json({ status: 'error', message: 'Error interno.' });
  }
});

module.exports = router;
