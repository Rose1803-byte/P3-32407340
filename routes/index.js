const express = require('express');
const router = express.Router();

// Importar todas tus rutas - CON .routes NO .router
const rawAppRoutes = require('./app.routes');
const rawAuthRoutes = require('./auth.routes');
// NOTE: el archivo real es `users.routes.js` (plural). Corregimos la ruta.
const rawUserRoutes = require('./users.routes');
const rawCategoryRoutes = require('./category.routes');
const rawTagRoutes = require('./tag.routes');
const rawProductRoutes = require('./product.routes');

function unwrapRoute(mod) {
	if (!mod) return mod;
	// Si ya es un Router (tiene .use), devolverlo
	if (typeof mod.use === 'function') return mod;
	// Si exportaron { router }
	if (mod.router && typeof mod.router.use === 'function') return mod.router;
	// Si usan export default
	if (mod.default && typeof mod.default.use === 'function') return mod.default;
	// Si exportaron {app, initDB} (routes/app.js), no es un router
	return mod;
}

const appRoutes = unwrapRoute(rawAppRoutes);
const authRoutes = unwrapRoute(rawAuthRoutes);
const userRoutes = unwrapRoute(rawUserRoutes);
const categoryRoutes = unwrapRoute(rawCategoryRoutes);
const tagRoutes = unwrapRoute(rawTagRoutes);
const productRoutes = unwrapRoute(rawProductRoutes);

// Configurar las rutas
// Solo montar si efectivamente son Routers, para evitar TypeError
if (appRoutes && typeof appRoutes.use === 'function') router.use('/', appRoutes);
if (authRoutes && typeof authRoutes.use === 'function') router.use('/auth', authRoutes);
if (userRoutes && typeof userRoutes.use === 'function') router.use('/users', userRoutes);
if (categoryRoutes && typeof categoryRoutes.use === 'function') router.use('/categories', categoryRoutes);
if (tagRoutes && typeof tagRoutes.use === 'function') router.use('/tags', tagRoutes);
if (productRoutes && typeof productRoutes.use === 'function') router.use('/products', productRoutes);

// Manejador 404 para rutas del API montadas en este router (/api/...)
router.use(function(req, res) {
	res.status(404).json({
		status: 'fail',
		data: { message: `Ruta no encontrada: ${req.originalUrl}` }
	});
});

module.exports = router;