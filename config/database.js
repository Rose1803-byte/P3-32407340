

const { Sequelize } = require('sequelize');

// Configuración de la base de datos
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: process.env.NODE_ENV === 'test' ? ':memory:' : './database/db.sqlite',
  logging: false, // Desactiva el logging de SQL en la consola
});

// Función para inicializar la base de datos
const initializeDatabase = async () => {
  try {
    await sequelize.authenticate();
    if (process.env.NODE_ENV !== 'test') {
      console.log('Conexión a la base de datos establecida correctamente.');
    }
    // Sincronizar modelos (¡Importante! Esto crea las tablas si no existen)
    await sequelize.sync({ force: false }); // force: false para no borrar datos
  } catch (error) {
    console.error('No se pudo conectar a la base de datos:', error);
  }
};

// Al final de config/database.js

module.exports = sequelize;
module.exports.initializeDatabase = initializeDatabase

