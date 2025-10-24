const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Modelo adaptado a la estructura actual de la base (campo nombreCompleto)
const User = sequelize.define('User', {
	email: {
		type: DataTypes.STRING,
		allowNull: false,
		unique: true,
		validate: { isEmail: true }
	},
	password: {
		type: DataTypes.STRING,
		allowNull: false
	},
	nombreCompleto: {
		type: DataTypes.STRING,
		allowNull: false
	}
}, {
	tableName: 'users',
	timestamps: true,
});

module.exports = User;

