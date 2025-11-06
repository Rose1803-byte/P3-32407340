const request = require('supertest');
const app = require('../app');
const { initDB, sequelize } = require('../models');

const ADMIN = { email: 'prodadmin@example.com', password: 'ProdPass123', nombreCompleto: 'Prod Admin' };

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  await initDB({ sync: true, force: true });
});

afterAll(async () => {
  await sequelize.close();
});

describe('Products endpoints', () => {
  let token;
  let categoryId, tagIds, createdProduct;

  beforeAll(async () => {
    await request(app).post('/api/auth/register').send(ADMIN);
    const login = await request(app).post('/api/auth/login').send({ email: ADMIN.email, password: ADMIN.password });
    token = login.body.data.token;

    // create a category and tags
    const c = await request(app).post('/api/categories').set('Authorization', `Bearer ${token}`).send({ name: 'Casual', description: 'Casual shoes' });
    categoryId = c.body.data.category.id;
    const t1 = await request(app).post('/api/tags').set('Authorization', `Bearer ${token}`).send({ name: 'sale' });
    const t2 = await request(app).post('/api/tags').set('Authorization', `Bearer ${token}`).send({ name: 'new' });
    tagIds = [t1.body.data.tag.id, t2.body.data.tag.id];
  });

  test('Protected POST /api/products should fail without token', async () => {
    const res = await request(app).post('/api/products').send({ name: 'Air Test', price: 99.99 });
    expect(res.statusCode).toBe(401);
  });

  test('Create product with category and tags (201)', async () => {
    const payload = { name: 'Air Test', description: 'Cool sneaker', price: 99.99, stock: 10, brand: 'AirBrand', size: '42', color: 'white', sku: 'SKU123', categoryId, tagIds };
    const res = await request(app).post('/api/products').set('Authorization', `Bearer ${token}`).send(payload);
    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('success');
    createdProduct = res.body.data.product;
    expect(createdProduct.slug).toBeDefined();
  });

  test('GET /api/products public listing and filter by brand and tag', async () => {
    const res = await request(app).get('/api/products').query({ brand: 'AirBrand', tags: tagIds.join(',') });
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('success');
    expect(Array.isArray(res.body.data.products)).toBe(true);
    expect(res.body.data.products.length).toBeGreaterThanOrEqual(1);
  });

  test('GET /p/:id-:slug returns product and self-healing redirect when slug wrong', async () => {
    const wrong = await request(app).get(`/p/${createdProduct.id}-wrong-slug`);
    // should redirect 301
    expect([301,302]).toContain(wrong.status); // express may respond 302 as well

    // correct URL
    const ok = await request(app).get(`/p/${createdProduct.id}-${createdProduct.slug}`);
    expect(ok.statusCode).toBe(200);
    expect(ok.body.status).toBe('success');
    expect(ok.body.data.product.id).toBe(createdProduct.id);
  });

  test('Protected GET /api/products/:id should require token', async () => {
    const res = await request(app).get(`/api/products/${createdProduct.id}`);
    expect(res.statusCode).toBe(401);
  });

  test('Protected GET /api/products/:id with token returns product', async () => {
    const res = await request(app).get(`/api/products/${createdProduct.id}`).set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.product.id).toBe(createdProduct.id);
  });

  test('Protected PUT /api/products/:id updates and regenerates slug if name changes', async () => {
    const res = await request(app).put(`/api/products/${createdProduct.id}`).set('Authorization', `Bearer ${token}`).send({ name: 'Air Test Updated', tagIds: tagIds.slice(0,1) });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.product.name).toBe('Air Test Updated');
    expect(res.body.data.product.slug).toBeDefined();
  });

  test('Protected DELETE /api/products/:id deletes product', async () => {
    const res = await request(app).delete(`/api/products/${createdProduct.id}`).set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
  });
});
