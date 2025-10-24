const { Sequelize } = require('sequelize');
const path = require('path');

// Ruta por defecto para el archivo sqlite (puede sobrescribirse con DB_STORAGE)
const storagePath = process.env.DB_STORAGE || path.join(__dirname, '..', 'database.db');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: storagePath,
  logging: false,
});

module.exports = sequelize;
