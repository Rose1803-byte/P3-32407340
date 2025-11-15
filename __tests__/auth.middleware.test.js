const request = require('supertest');
const express = require('express');

// 1. MOCKEAR SOLO 'jsonwebtoken'
jest.mock('jsonwebtoken', () => ({
  verify: jest.fn(),
}));

// 2. MOCKEAR NUESTRO NUEVO 'config.js'
jest.mock('../config', () => ({
  JWT_SECRET: 'super-secreto-de-prueba-y-desarrollo'
}));

// 3. IMPORTAR EL MIDDLEWARE (¡AHORA SÍ FUNCIONA!)
// Usamos llaves porque tu archivo exporta un objeto
const { authenticateToken } = require('../middleware/auth.middleware');

// 4. Importar 'jwt' (el mock) para poder controlarlo
const jwt = require('jsonwebtoken');

describe('Middleware de Autenticación (Prueba de Integración)', () => {
  
  let app;

  beforeEach(() => {
    // Creamos la app para cada prueba
    app = express(); 
    app.use('/protected', authenticateToken, (req, res) => {
      res.status(200).json({ user: req.user });
    });

    // Limpiamos el mock
    jest.mocked(jwt.verify).mockClear();
  });

  it('debería retornar 401 (Acceso Denegado) si no se provee un token', async () => {
    const response = await request(app).get('/protected'); 
    expect(response.status).toBe(401);
    expect(response.body.data.message).toBe("Acceso denegado. Se requiere token.");
  });

  it('debería retornar 403 (Token Inválido) si jwt.verify falla', async () => {
    jwt.verify.mockImplementation((token, secret, callback) => {
        callback(new Error('Token signature invalid'), undefined);
    });

    const response = await request(app) 
        .get('/protected')
        .set('Authorization', 'Bearer token.invalido.falso');

    expect(response.status).toBe(403);
    expect(response.body.data.message).toBe("Token inválido o expirado.");
  });

  it('debería llamar a next() y adjuntar el usuario si el token es válido', async () => {
    const mockUserPayload = { id: 1, email: 'user@test.com' };

    jwt.verify.mockImplementation((token, secret, callback) => {
        callback(undefined, mockUserPayload);
    });

    const response = await request(app)
        .get('/protected')
        .set('Authorization', 'Bearer token.valido.real');

    expect(response.status).toBe(200);
    expect(response.body.user).toEqual(mockUserPayload);
  });

});