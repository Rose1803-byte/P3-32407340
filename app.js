// app.js (Código 100% Corregido)

const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerSetup = require('./swagger-setup');
// ¡¡AQUÍ ESTÁ LA CORRECCIÓN DE RUTA (BASADA EN TU CAPTURA)!!
const { initializeDatabase } = require('./config/database.js'); 
const apiRoutes = require('./routes');

// 1. Importar de config.js
const { PORT } = require('./config.js'); // Usamos config.js (el archivo)

// 2. Definir la app
const app = express();

// Middlewares
app.use(express.json());

// Rutas
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSetup));
app.use('/api', apiRoutes);

// 4. Manejador de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ status: 'error', message: 'Algo salió mal en el servidor' });
});

// 5. Inicializar DB y escuchar
initializeDatabase().then(() => {
  // ¡Importante! No iniciar el servidor si estamos en modo 'test'
  if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  }
});

// 6. Exportar app (¡¡ESTA ES LA CORRECCIÓN IMPORTANTE!!)
module.exports = app;