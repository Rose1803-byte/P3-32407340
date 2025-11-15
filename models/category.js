// models/category.js
'use strict';
module.exports = (sequelize, DataTypes) => {
  const Category = sequelize.db('Category', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    description: {
      type: DataTypes.TEXT
    }
  });
  return Category;
};