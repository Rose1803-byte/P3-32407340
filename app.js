// app.js (¡El Código Limpio y Corregido!)

const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerSetup = require('./swagger-setup');
const dbConfig = require('./config/database.js'); 
const initializeDatabase = dbConfig.initializeDatabase || (async () => {});
const apiRoutes = require('./routes'); 
const { PORT } = require('./config.js'); 
const productPublicRoutes = require('./routes/productPublic.routes');

const app = express();

// Middlewares
app.use(express.json());

// Rutas
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSetup));
app.use('/api', apiRoutes); 
// Ruta pública para productos 
app.use('/p', productPublicRoutes);

// Ruta raíz simple para healthcheck y mensaje de bienvenida
app.get('/', (req, res) => {
  res.status(200).send('Welcome to express');
});

// Manejador de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ status: 'error', message: 'Algo salió mal en el servidor' });
});


module.exports = app;

module.exports.initDB = initializeDatabase;