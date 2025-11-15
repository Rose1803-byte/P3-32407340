// models/tag.js (CÓDIGO CORREGIDO: Exporta una función)

module.exports = (sequelize, DataTypes) => {
    const Tag = sequelize.define('Tag', {
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        }
    }, {
        tableName: 'tags',
        timestamps: false
    });
    return Tag;
};