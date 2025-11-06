const { Sequelize } = require('sequelize');
const path = require('path');

// Ruta por defecto para el archivo sqlite (puede sobrescribirse con DB_STORAGE)
// En tests, usar base en memoria para evitar problemas de concurrencia/locking
const storagePath = process.env.DB_STORAGE || (process.env.NODE_ENV === 'test' ? ':memory:' : path.join(__dirname, '..', 'database.db'));

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: storagePath,
  logging: false,
});

module.exports = sequelize;
