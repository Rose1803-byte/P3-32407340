const { Product, Category, Tag } = require('../models');

class ProductRepository {
  async create(data) {
    const { tagIds, categoryId, ...payload } = data;
    const product = await Product.create(payload);
    if (categoryId) {
      const cat = await Category.findByPk(categoryId);
      if (cat) await product.setCategory(cat);
    }
    if (Array.isArray(tagIds) && tagIds.length) {
      const tags = await Tag.findAll({ where: { id: tagIds } });
      await product.setTags(tags);
    }
    return await Product.findByPk(product.id, { include: [{ model: Category, as: 'category' }, { model: Tag, as: 'tags', through: { attributes: [] } }] });
  }

  async update(id, data) {
    const product = await Product.findByPk(id);
    if (!product) return null;
    const { tagIds, categoryId, ...payload } = data;
    Object.assign(product, payload);
    await product.save();
    if (categoryId) {
      const cat = await Category.findByPk(categoryId);
      if (cat) await product.setCategory(cat);
    }
    if (Array.isArray(tagIds)) {
      const tags = await Tag.findAll({ where: { id: tagIds } });
      await product.setTags(tags);
    }
    return await Product.findByPk(product.id, { include: [{ model: Category, as: 'category' }, { model: Tag, as: 'tags', through: { attributes: [] } }] });
  }

  async delete(id) {
    const product = await Product.findByPk(id);
    if (!product) return false;
    await product.destroy();
    return true;
  }

  async getById(id) {
    return await Product.findByPk(id, { include: [{ model: Category, as: 'category' }, { model: Tag, as: 'tags', through: { attributes: [] } }] });
  }

  // search: accepts { filters, pagination } where filters is object from QueryBuilder
  async search({ where = {}, include = [], limit = 10, offset = 0 }) {
    const opts = { where, include, limit, offset, distinct: true };
    return await Product.findAndCountAll(opts);
  }
}

module.exports = new ProductRepository();
