// config.js (en la carpeta raíz)

// Importa dotenv para cargar las variables de .env
require('dotenv').config();

const config = {
  // Asegúrate de que tus variables .env se llamen así
  JWT_SECRET: process.env.JWT_SECRET || 'tu-secreto-por-defecto',
  PORT: process.env.PORT || 3000,
};

module.exports = config;