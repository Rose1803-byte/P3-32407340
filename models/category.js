// models/category.js (CÓDIGO CORREGIDO: Exporta una función)

module.exports = (sequelize, DataTypes) => {
    const Category = sequelize.define('Category', {
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    }, {
        tableName: 'categories',
        timestamps: true
    });
    return Category;
};