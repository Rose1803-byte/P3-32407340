// models/index.js (¡El Código Corregido y Completo!)

'use strict';
// ¡¡ESTA ES LA LÍNEA CLAVE DEL ERROR!!
const { sequelize } = require('../config/database.js'); // ¡¡Con llaves!!
const { DataTypes } = require('sequelize');

// Importar todos los modelos
const User = require('./users.js')(sequelize, DataTypes);
const Category = require('./category.js')(sequelize, DataTypes);
const Tag = require('./tag.js')(sequelize, DataTypes);
const Product = require('./product.js')(sequelize, DataTypes);

// --- Definir Relaciones (Importante para Task 2) ---

// 1. Un Producto pertenece a una Categoría
Category.hasMany(Product, { foreignKey: 'categoryId' });
Product.belongsTo(Category, { foreignKey: 'categoryId' });

// 2. Un Producto tiene muchas Tags (Muchos-a-Muchos)
// Creamos la tabla intermedia ProductTag
const ProductTag = sequelize.define('ProductTag', {}, { timestamps: false });
Product.belongsToMany(Tag, { through: ProductTag, foreignKey: 'productId' });
Tag.belongsToMany(Product, { through: ProductTag, foreignKey: 'tagId' });

// Exportar todo
const db = {
  sequelize, // Exportamos la instancia de sequelize
  User,
  Category,
  Tag,
  Product,
  ProductTag
};

module.exports = db;