// models/users.js (CÓDIGO CORREGIDO: Exporta una función)

module.exports = (sequelize, DataTypes) => { 
	const User = sequelize.define('User', {
		email: {
			type: DataTypes.STRING, // <-- DataTypes viene como argumento
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
	return User;
};