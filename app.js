// app.js (¡El Código Limpio y Corregido!)

const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerSetup = require('./swagger-setup');
const { initializeDatabase } = require('./config/database.js'); // <-- Ruta correcta
const apiRoutes = require('./routes'); // <-- Importa de routes/index.js
const { PORT } = require('./config.js'); // <-- Importa de config.js

const app = express();

// Middlewares
app.use(express.json());

// Rutas
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSetup));
app.use('/api', apiRoutes); // <-- ¡Aquí se montan TODAS las rutas!

// Manejador de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ status: 'error', message: 'Algo salió mal en el servidor' });
});

// Inicializar DB y escuchar
initializeDatabase().then(() => {
  if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  }
});

// ¡¡Exporta SOLO LA APP!!
module.exports = app;