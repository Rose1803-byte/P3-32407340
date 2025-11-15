// routes/index.js (Código Completo y Corregido)

const express = require('express');
const router = express.Router();

// Importar todas tus rutas
const appRoutes = require('./app.js'); // Rutas base (ping, about)
const authRoutes = require('./auth.js');
const userRoutes = require('./users.js');
const categoryRoutes = require('./category.routes.js');
const tagRoutes = require('./tag.routes.js');
const productAdminRoutes = require('./product.routes.js');
const productPublicRoutes = require('./productPublic.routes.js');

// Configurar las rutas
router.use('/', appRoutes); // -> /api/ping, /api/about
router.use('/auth', authRoutes); // -> /api/auth/login, /api/auth/register
router.use('/users', userRoutes); // -> /api/users
router.use('/categories', categoryRoutes); // -> /api/categories
router.use('/tags', tagRoutes); // -> /api/tags
router.use('/products', productAdminRoutes); // -> /api/products (admin)
router.use('/', productPublicRoutes); // -> /api/p/:id-:slug

module.exports = router;