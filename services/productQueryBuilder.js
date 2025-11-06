const { Op } = require('sequelize');
const { Category, Tag } = require('../models');

class ProductQueryBuilder {
  constructor(query) {
    this.query = query || {};
    this.where = {};
    this.include = [];
    this.limit = 10;
    this.offset = 0;
  }

  buildPagination() {
    const page = parseInt(this.query.page) || 1;
    this.limit = Math.min(parseInt(this.query.limit) || 10, 100);
    this.offset = (page - 1) * this.limit;
    return this;
  }

  buildSearch() {
    if (this.query.search) {
      this.where[Op.or] = [
        { name: { [Op.like]: `%${this.query.search}%` } },
        { description: { [Op.like]: `%${this.query.search}%` } }
      ];
    }
    return this;
  }

  buildCategory() {
    if (this.query.category) {
      const cat = isNaN(this.query.category) ? { name: this.query.category } : { id: this.query.category };
      this.include.push({ model: Category, as: 'category', where: cat });
    } else {
      this.include.push({ model: Category, as: 'category' });
    }
    return this;
  }

  buildTags() {
    if (this.query.tags) {
      const tagIds = this.query.tags.split(',').map(t => parseInt(t)).filter(Boolean);
      if (tagIds.length) {
        this.include.push({ model: Tag, as: 'tags', where: { id: tagIds }, through: { attributes: [] } });
      } else {
        this.include.push({ model: Tag, as: 'tags', through: { attributes: [] } });
      }
    } else {
      this.include.push({ model: Tag, as: 'tags', through: { attributes: [] } });
    }
    return this;
  }

  buildPriceRange() {
    if (this.query.price_min || this.query.price_max) {
      this.where.price = {};
      if (this.query.price_min) this.where.price[Op.gte] = this.query.price_min;
      if (this.query.price_max) this.where.price[Op.lte] = this.query.price_max;
    }
    return this;
  }

  // Custom filters for 'tenis' line: brand, size, color
  buildCustomFilters() {
    if (this.query.brand) this.where.brand = this.query.brand;
    if (this.query.size) this.where.size = this.query.size;
    if (this.query.color) this.where.color = this.query.color;
    return this;
  }

  buildAll() {
    return this.buildPagination().buildSearch().buildPriceRange().buildCustomFilters().buildCategory().buildTags();
  }

  getResult() {
    return { where: this.where, include: this.include, limit: this.limit, offset: this.offset };
  }
}

module.exports = ProductQueryBuilder;
