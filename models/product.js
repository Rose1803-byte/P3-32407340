// models/product.js

const { Op } = require('sequelize'); 
let slugify = require('../utils/slugify');

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
            type: DataTypes.DECIMAL(10,2),
            allowNull: false,
            defaultValue: 0
        },
        stock: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
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
        sku: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: true
        },
        slug: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        }
    }, {
        tableName: 'products',
        timestamps: true
    });

    // Generar slug único antes de validar/crear
    Product.beforeValidate(async (product, options) => {
        try {
            if (!product.name) return;

            // Generar slug base a partir del nombre
            const base = slugify(product.name || '').toString();
            let candidate = base || String(product.name).toLowerCase().replace(/\s+/g, '-');

            // Si el producto ya tiene slug y el nombre no cambió, dejarlo
            if (product.slug && product._previousDataValues && product._previousDataValues.name === product.name) {
                return;
            }

            // Buscar slugs similares en la BD para asegurar unicidad
            const whereLike = { slug: { [Op.like]: `${candidate}%` } };
            // Excluir el propio producto si existe (en update)
            if (product.id) {
                whereLike.id = { [Op.ne]: product.id };
            }

            const existing = await Product.findAll({ where: whereLike, attributes: ['slug'] });
            if (!existing || existing.length === 0) {
                product.slug = candidate;
                return;
            }

            // Crear un set de sufijos existentes
            const taken = new Set(existing.map(e => e.slug));
            let i = 1;
            let newSlug = candidate + '-' + i;
            while (taken.has(newSlug)) {
                i++;
                newSlug = candidate + '-' + i;
            }
            product.slug = newSlug;
        } catch (e) {
            // En caso de fallo en la generación no bloquear, asignar fallback
            product.slug = product.slug || String(product.name).toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '');
        }
    });

    return Product;
};