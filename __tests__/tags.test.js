const request = require('supertest');
const app = require('../app');
const { initDB, sequelize } = require('../models');

const ADMIN = { email: 'tagadmin@example.com', password: 'TagPass123', nombreCompleto: 'Tag Admin' };

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  await initDB({ sync: true, force: true });
});

afterAll(async () => {
  await sequelize.close();
});

describe('CRUD Tags (/api/tags)', () => {
  let token;
  beforeAll(async () => {
    await request(app).post('/api/auth/register').send(ADMIN);
    const login = await request(app).post('/api/auth/login').send({ email: ADMIN.email, password: ADMIN.password });
    token = login.body.data.token;
  });

  test('POST /api/tags - Sin token debe fallar (401)', async () => {
    const res = await request(app).post('/api/tags').send({ name: 'limited' });
    expect(res.statusCode).toBe(401);
    expect(res.body.status).toBe('fail');
  });

  test('POST /api/tags - Crear tag con token (201)', async () => {
    const res = await request(app).post('/api/tags').set('Authorization', `Bearer ${token}`).send({ name: 'limited' });
    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('success');
    expect(res.body.data.tag.name).toBe('limited');
  });

  test('GET /api/tags - Obtener lista con token (200)', async () => {
    const res = await request(app).get('/api/tags').set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('success');
    expect(Array.isArray(res.body.data.tags)).toBe(true);
  });

  test('PUT /api/tags/:id - Actualizar tag (200)', async () => {
    const list = await request(app).get('/api/tags').set('Authorization', `Bearer ${token}`);
    const id = list.body.data.tags[0].id;
    const res = await request(app).put(`/api/tags/${id}`).set('Authorization', `Bearer ${token}`).send({ name: 'limited-up' });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.tag.name).toBe('limited-up');
  });

  test('DELETE /api/tags/:id - Eliminar (200)', async () => {
    const list = await request(app).get('/api/tags').set('Authorization', `Bearer ${token}`);
    const id = list.body.data.tags[0].id;
    const res = await request(app).delete(`/api/tags/${id}`).set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('success');
  });
});
