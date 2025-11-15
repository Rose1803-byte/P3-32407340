// models/index.js (FINAL, ORQUESTADOR Y ASOCIACIONES)

// Importar la Clase Sequelize y DataTypes (Necesario para definir modelos)
const { Sequelize, DataTypes } = require('sequelize'); 
const sequelize = require('../config/database.js'); // Importa la instancia DB

// 1. Cargar las FUNCIONES de definición de los modelos
const UserModelDef = require('./users.js'); 
const CategoryModelDef = require('./category.js');
const TagModelDef = require('./tag.js');
const ProductModelDef = require('./product.js');

// 2. Definir los modelos INVOCANDO las funciones (pasa la conexión y los tipos de datos)
const User = UserModelDef(sequelize, DataTypes); 
const Category = CategoryModelDef(sequelize, DataTypes);
const Tag = TagModelDef(sequelize, DataTypes);
const Product = ProductModelDef(sequelize, DataTypes); 

// --- Asociaciones (Se definen aquí, después de que todos los modelos son clases válidas)
if (Product && Category) {
  Product.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });
  Category.hasMany(Product, { foreignKey: 'categoryId', as: 'products' });
}

if (Product && Tag) {
  // Definición de tabla intermedia ProductTag
  Product.belongsToMany(Tag, { through: 'ProductTags', as: 'tags', foreignKey: 'productId', otherKey: 'tagId', timestamps: false });
  Tag.belongsToMany(Product, { through: 'ProductTags', as: 'products', foreignKey: 'tagId', otherKey: 'productId', timestamps: false });
}

// Función initDB (Necesaria para inicializar la base de datos en tests)
async function initDB(options = { sync: true, force: false }) {
  try {
    await sequelize.authenticate();
    if (options.sync) {
      // Sincronizar modelos
      await sequelize.sync({ force: !!options.force });
    }
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

// Exportar todo 
const db = {
  sequelize,
  User,
  Category,
  Tag,
  Product,
  initDB
};

module.exports = db;