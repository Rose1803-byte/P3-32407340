const request = require('supertest');
const {app} = require('../routes/app'); // Corregido: Importa desde la raíz del proyecto

describe('Pruebas de la API Base (Task 0)', () => {

  test('GET /ping debería responder con código 200 (OK)', async () => {
    const response = await request(app).get('/ping');
    expect(response.statusCode).toBe(200);
    // Verificar que la respuesta sea JSON con status 'ok' según la última corrección de app.js
    expect(response.headers['content-type']).toMatch(/json/);
    expect(response.body).toEqual({ status: 'ok' });
  });

  test('GET /about debería devolver los datos del estudiante en formato JSend', async () => {
    const response = await request(app).get('/about');

    expect(response.statusCode).toBe(200);
    expect(response.headers['content-type']).toMatch(/json/);

    // Verificar estructura JSend
    expect(response.body.status).toBe('success');
    expect(response.body.data).toBeDefined();

    // Verificar campos dentro de data
    expect(response.body.data.nombreCompleto).toBeDefined();
    expect(response.body.data.cedula).toBeDefined();
    expect(response.body.data.seccion).toBeDefined();
  });

  test('GET a una ruta no existente debería devolver código 404 (Not Found) en formato JSend', async () => {
    const response = await request(app).get('/ruta-que-no-existe');
    expect(response.statusCode).toBe(404);
    expect(response.headers['content-type']).toMatch(/json/);

    // Verificar estructura JSend para errores 'fail'
    expect(response.body.status).toBe('fail');
    expect(response.body.data).toBeDefined();
    expect(response.body.data.message).toContain('Ruta no encontrada'); // O el mensaje exacto de tu manejador 404
  });

});

