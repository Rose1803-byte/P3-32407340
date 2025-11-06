// Archivo raíz que exporta la app Express y helpers creados en routes/app.js
const routesApp = require('./routes/app');

// Exportar todo el objeto para que el arranque (bin/www) pueda inicializar la BD
// Archivo raíz que exporta la app Express y expone initDB como propiedad
// Exportar la instancia express para compatibilidad con los tests (supertest)
module.exports = routesApp.app;
// Adjuntar initDB como propiedad sobre la función exportada para que bin/www
module.exports.initDB = routesApp.initDB;
