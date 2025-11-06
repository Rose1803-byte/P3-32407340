const { DataTypes, Op } = require('sequelize');
const sequelize = require('../config/database');
let slugify = require('../utils/slugify');
// Soporte para CommonJS y posibles wrappers (e.g. { default: fn })
if (slugify && typeof slugify !== 'function' && typeof slugify.default === 'function') {
	slugify = slugify.default;
}
// Si sigue sin ser función, intentar extraer cualquier función exportada del módulo
if (typeof slugify !== 'function' && slugify && typeof slugify === 'object') {
	const fn = Object.values(slugify).find(v => typeof v === 'function');
	if (fn) slugify = fn;
}
// Fallback: implementación local si por alguna razón la importación falla
if (typeof slugify !== 'function') {
	console.warn('Advertencia: slugify importado no es función. Usando fallback local.');
	slugify = function(text) {
		if (typeof text !== 'string' || text === null) {
			return '';
		}
		return text
			.toString()
			.toLowerCase()
			.trim()
			.replace(/\s+/g, '-')
			.replace(/[^\w\-]+/g, '')
			.replace(/\-\-+/g, '-')
			.replace(/^-+/, '')
			.replace(/-+$/, '');
	};
}

// Modelo para la línea: Tenis / Zapatillas Deportivas
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
		defaultValue: 0.00
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
		// Intentar garantizar unicidad de slug agregando sufijo numérico si es necesario
		while (true) {
			const existing = await Product.findOne({ where: { slug: candidate, id: { [Op.ne]: product.id || null } } });
			if (!existing) break;
			count += 1;
			candidate = `${base}-${count}`;
		}
		product.slug = candidate;
	}
});

module.exports = Product;
