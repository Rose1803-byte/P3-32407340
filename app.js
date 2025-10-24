// Archivo raíz que exporta la app Express creada en routes/app.js
const routesApp = require('./routes/app');

// `routes/app.js` exporta { app, JWT_SECRET }
module.exports = routesApp.app;
