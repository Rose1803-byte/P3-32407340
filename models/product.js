// models/product.js (CÓDIGO CORREGIDO: Exporta una función)
// Mantenemos estas importaciones ya que se usan en la lógica del hook fuera de los argumentos.
const { Op } = require('sequelize'); 
let slugify = require('../utils/slugify');

// ... (MANTENER AQUÍ LA LÓGICA DE FALLBACK DE SLUGIFY EXACTAMENTE COMO LA TENÍAS) ...

module.exports = (sequelize, DataTypes) => { 

    const Product = sequelize.define('Product', {
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0.00
        },
        stock: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        // Atributos personalizados para Zapatillas Deportivas (Tu línea de producto)
        brand: {
            type: DataTypes.STRING,
            allowNull: true
        },
        size: {
            type: DataTypes.STRING,
            allowNull: true
        },
        color: {
            type: DataTypes.STRING,
            allowNull: true
        },
        // Fin de atributos personalizados
        sku: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: true
        },
        releaseYear: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        slug: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        }
    }, {
        tableName: 'products',
        timestamps: true,
    });

    // Hook para generar slug único a partir del name
    Product.beforeValidate(async (product, options) => {
        if (!product.slug || product.changed('name')) {
            if (typeof slugify !== 'function') {
                throw new Error('slugify no es una función. Verifica la importación en utils/slugify.js');
            }
            let base = slugify(product.name || 'producto');
            let candidate = base;
            let count = 0;
            while (true) {
                const existing = await Product.findOne({ where: { slug: candidate, id: { [Op.ne]: product.id || null } } });
                if (!existing) break;
                count += 1;
                candidate = `${base}-${count}`;
            }
            product.slug = candidate;
        }
    });

    return Product;
};