// models/index.js (FINAL Y CORREGIDO)

// Importar la Clase Sequelize y DataTypes de la librería
const { Sequelize, DataTypes } = require('sequelize'); 
const sequelize = require('../config/database.js'); // Ya corregido: Importa la instancia DB

// Cargar modelos (usando DataTypes directamente)
const User = require('./users.js')(sequelize, DataTypes); // USANDO DataTypes EN LUGAR DE Sequelize.DataTypes
const Category = require('./category.js')(sequelize, DataTypes);
const Tag = require('./tag.js')(sequelize, DataTypes);
const Product = require('./product.js')(sequelize, DataTypes);

// Definir Relaciones
Category.hasMany(Product, { foreignKey: 'categoryId' });
Product.belongsTo(Category, { foreignKey: 'categoryId' });

const ProductTag = sequelize.define('ProductTag', {}, { timestamps: false });
Product.belongsToMany(Tag, { through: ProductTag, foreignKey: 'productId' });
Tag.belongsToMany(Product, { through: ProductTag, foreignKey: 'tagId' });

// Exportar todo
const db = {
 sequelize,
 User,
 Category,
 Tag,
 Product,
 ProductTag
};

module.exports = db;