const express = require('express');
const router = express.Router();
const { Tag } = require('../models');
const { authenticateToken } = require('./auth.routes');

router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const tags = await Tag.findAll();
    res.status(200).json({ status: 'success', data: { tags } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ status: 'error', message: 'Error interno.' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ status: 'fail', data: { message: 'name es requerido' } });
    const tag = await Tag.create({ name });
    res.status(201).json({ status: 'success', data: { tag } });
  } catch (e) {
    if (e.name === 'SequelizeUniqueConstraintError') return res.status(409).json({ status: 'fail', data: { message: 'Tag ya existe.' } });
    console.error(e);
    res.status(500).json({ status: 'error', message: 'Error interno.' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const tag = await Tag.findByPk(req.params.id);
    if (!tag) return res.status(404).json({ status: 'fail', data: { message: 'Tag no encontrado.' } });
    res.status(200).json({ status: 'success', data: { tag } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ status: 'error', message: 'Error interno.' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const tag = await Tag.findByPk(req.params.id);
    if (!tag) return res.status(404).json({ status: 'fail', data: { message: 'Tag no encontrado.' } });
    const { name } = req.body;
    if (name) tag.name = name;
    await tag.save();
    res.status(200).json({ status: 'success', data: { tag } });
  } catch (e) {
    if (e.name === 'SequelizeUniqueConstraintError') return res.status(409).json({ status: 'fail', data: { message: 'El nombre ya existe.' } });
    console.error(e);
    res.status(500).json({ status: 'error', message: 'Error interno.' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const tag = await Tag.findByPk(req.params.id);
    if (!tag) return res.status(404).json({ status: 'fail', data: { message: 'Tag no encontrado.' } });
    await tag.destroy();
    res.status(200).json({ status: 'success', data: null });
  } catch (e) {
    console.error(e);
    res.status(500).json({ status: 'error', message: 'Error interno.' });
  }
});

module.exports = router;
