const request = require('supertest');
const app = require('../app');
const { initDB, sequelize } = require('../models');

const ADMIN = { email: 'admin@example.com', password: 'AdminPass123', nombreCompleto: 'Admin' };

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  await initDB({ sync: true, force: true });
});

afterAll(async () => {
  await sequelize.close();
});

describe('CRUD Categories (/api/categories)', () => {
  let token;
  beforeAll(async () => {
    await request(app).post('/api/auth/register').send(ADMIN);
    const login = await request(app).post('/api/auth/login').send({ email: ADMIN.email, password: ADMIN.password });
    token = login.body.data.token;
  });

  test('POST /api/categories - Sin token debe fallar (401)', async () => {
    const res = await request(app).post('/api/categories').send({ name: 'Running', description: 'Zapatillas para correr' });
    expect(res.statusCode).toBe(401);
    expect(res.body.status).toBe('fail');
  });

  test('POST /api/categories - Crear categoría con token (201)', async () => {
    const res = await request(app).post('/api/categories').set('Authorization', `Bearer ${token}`).send({ name: 'Running', description: 'Zapatillas para correr' });
    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('success');
    expect(res.body.data.category.name).toBe('Running');
  });

  test('GET /api/categories - Obtener lista con token (200)', async () => {
    const res = await request(app).get('/api/categories').set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('success');
    expect(Array.isArray(res.body.data.categories)).toBe(true);
  });

  test('PUT /api/categories/:id - Actualizar categoría (200)', async () => {
    const list = await request(app).get('/api/categories').set('Authorization', `Bearer ${token}`);
    const id = list.body.data.categories[0].id;
    const res = await request(app).put(`/api/categories/${id}`).set('Authorization', `Bearer ${token}`).send({ description: 'Updated' });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.category.description).toBe('Updated');
  });

  test('DELETE /api/categories/:id - Eliminar (200)', async () => {
    const list = await request(app).get('/api/categories').set('Authorization', `Bearer ${token}`);
    const id = list.body.data.categories[0].id;
    const res = await request(app).delete(`/api/categories/${id}`).set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('success');
  });
});
