const sequelize = require('../config/database');
const User = require('./users');
const Category = require('./category');
const Tag = require('./tag');
const Product = require('./product');

// --- Asociaciones (Category, Tag, Product)
// Product -> Category (one category has many products)
if (Product && Category) {
  Product.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });
  Category.hasMany(Product, { foreignKey: 'categoryId', as: 'products' });
}

// Product <-> Tag (many-to-many)
if (Product && Tag) {
  Product.belongsToMany(Tag, { through: 'ProductTags', as: 'tags', foreignKey: 'productId', otherKey: 'tagId', timestamps: false });
  Tag.belongsToMany(Product, { through: 'ProductTags', as: 'products', foreignKey: 'tagId', otherKey: 'productId', timestamps: false });
}

// Inicializa la conexión y sincroniza los modelos
async function initDB(options = { sync: true, force: false }) {
  try {
    await sequelize.authenticate();
    if (options.sync) {
      // Pasar force cuando se indique (útil en tests)
      await sequelize.sync({ force: !!options.force });
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
  Category,
  Tag,
  Product,
  initDB,
};
