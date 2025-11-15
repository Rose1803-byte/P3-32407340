// app.js (¡El Código Limpio y Corregido!)

const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerSetup = require('./swagger-setup');
const dbConfig = require('./config/database.js'); // <-- Ruta correcta
const initializeDatabase = dbConfig.initializeDatabase || (async () => {});
const apiRoutes = require('./routes'); // <-- Importa de routes/index.js
const { PORT } = require('./config.js'); // <-- Importa de config.js
const productPublicRoutes = require('./routes/productPublic.routes');

const app = express();

// Middlewares
app.use(express.json());

// Rutas
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSetup));
app.use('/api', apiRoutes); // <-- ¡Aquí se montan TODAS las rutas!
// Ruta pública para productos (self-healing)
app.use('/p', productPublicRoutes);

// Manejador de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ status: 'error', message: 'Algo salió mal en el servidor' });
});

// No arrancar el servidor aquí: `bin/www` se encarga de `listen`.
// Exportar la app y la función de inicializar la BD para que el starter la use.
// Exportar la app como valor principal para compatibilidad con los tests
module.exports = app;
// También exponer initDB como propiedad para que `bin/www` pueda inicializar la BD
module.exports.initDB = initializeDatabase;