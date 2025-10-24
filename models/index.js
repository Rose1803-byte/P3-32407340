const sequelize = require('../config/database');
const User = require('./users');

// Inicializa la conexión y sincroniza los modelos
async function initDB(options = { sync: true }) {
  try {
    await sequelize.authenticate();
    if (options.sync) {
      await sequelize.sync();
    }
    // Evitar logs durante los tests para que Jest no reciba logs después de finalizar
    if (process.env.NODE_ENV !== 'test') {
      console.log('Sequelize conectado y modelos sincronizados.');
    }
  } catch (err) {
    if (process.env.NODE_ENV !== 'test') {
      console.error('Error al inicializar Sequelize:', err);
    }
    throw err;
  }
}

module.exports = {
  sequelize,
  User,
  initDB,
};
