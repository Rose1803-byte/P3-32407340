// __tests__/auth.test.js
const request = require('supertest');
const app = require('../app'); // ahora la app se exporta desde la raíz
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { sequelize, User } = require('../models');

// Datos de prueba
const TEST_USER = {
    email: "test.user@example.com",
    password: "Password123",
    nombreCompleto: "Usuario de Prueba"
};

// =========================================================================
// SETUP: Inicializar y limpiar la base de datos antes de todas las pruebas
// =========================================================================
beforeAll(async () => {
    // Asegurar que Sequelize inicializó y crear las tablas vacías solo una vez
    try {
        await sequelize.sync({ force: true }); // recrea tablas vacías
    } catch (e) {
        console.error('Error in beforeAll sequelize.sync:', e.message);
        throw e;
    }
});

// Al final de todas las pruebas, cerramos la conexión a la DB
afterAll(async () => {
    try {
        await sequelize.close();
    } catch (e) {
        // ignorar
    }
});


// =========================================================================
// PRUEBAS DE AUTENTICACIÓN (Task 1: /api/auth/register, /api/auth/login, /api/auth/me)
// =========================================================================

describe('Task 1: Autenticación (/api/auth)', () => {
    let authToken = null; // Variable para almacenar el token después del login

    test('POST /api/auth/register - 1: Registro Exitoso (201)', async () => {
        const response = await request(app)
            .post('/api/auth/register')
            .send(TEST_USER)
            .expect('Content-Type', /json/)
            .expect(201);

        expect(response.body.status).toBe('success');
        expect(response.body.data.id).toBeDefined();
        expect(response.body.data.email).toBe(TEST_USER.email);
        expect(response.body.data.nombreCompleto).toBe(TEST_USER.nombreCompleto); // Verificar nombreCompleto
    });

    test('POST /api/auth/register - 2: Email Duplicado (409)', async () => {
        const response = await request(app)
            .post('/api/auth/register')
            .send(TEST_USER) // Intenta registrar el mismo usuario otra vez
            .expect('Content-Type', /json/)
            .expect(409);

    expect(response.body.status).toBe('fail');
    // Mensaje flexible: puede contener 'email' o 'correo' pero debe indicar que está registrado
    expect(response.body.data.message.toLowerCase()).toContain('registrad');
    });

    test('POST /api/auth/login - 3: Login Exitoso y Obtención de JWT (200)', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send({
                email: TEST_USER.email,
                password: TEST_USER.password
            })
            .expect('Content-Type', /json/)
            .expect(200);

        expect(response.body.status).toBe('success');
        expect(response.body.data.token).toBeDefined();

    // Guardamos el token para las pruebas protegidas posteriores
    authToken = response.body.data.token;

    // Verificar el contenido del token (opcional)
    const decoded = jwt.decode(authToken);
    expect(decoded.id).toBeDefined(); // usamos { id, email } en el payload
    expect(decoded.email).toBe(TEST_USER.email);
    });

    test('POST /api/auth/login - 4: Credenciales Inválidas (401)', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send({
                email: TEST_USER.email,
                password: 'WrongPassword'
            })
            .expect('Content-Type', /json/)
            .expect(401);

        expect(response.body.status).toBe('fail');
        expect(response.body.data.message).toContain('Credenciales inválidas');
    });

    test('GET /api/auth/me - 5: Acceso Denegado sin Token (401)', async () => {
        await request(app)
            .get('/api/auth/me')
            .expect('Content-Type', /json/)
            .expect(401); // 401 Unauthorized
    });

    test('GET /api/auth/me - 6: Obtener Perfil Exitosamente (200)', async () => {
        // Asegurarse de que el token se obtuvo en la prueba de login
        if (!authToken) {
            throw new Error("El token de autenticación no se obtuvo en la prueba de login.");
        }

        const response = await request(app)
            .get('/api/auth/me')
            .set('Authorization', `Bearer ${authToken}`)
            .expect('Content-Type', /json/)
            .expect(200);

        expect(response.body.status).toBe('success');
        expect(response.body.data.user.email).toBe(TEST_USER.email);
        expect(response.body.data.user.nombreCompleto).toBe(TEST_USER.nombreCompleto);
    });
});


// =========================================================================
// PRUEBAS CRUD PROTEGIDAS (/api/users)
// =========================================================================

describe('Task 1: CRUD de Usuarios Protegido (/api/users)', () => {
    let token;
    let newUserId;
    const CRUD_USER_EMAIL = "crud.test@example.com";
    const CRUD_USER_PASSWORD = "CrudPassword123";
    const CRUD_USER_NAME = "Usuario CRUD";

    // Obtener token antes de correr las pruebas CRUD
    beforeAll(async () => {
        // Crear un usuario de prueba para obtener un token
        try {
            await User.destroy({ where: { email: CRUD_USER_EMAIL } });

            await request(app).post('/api/auth/register').send({
                email: CRUD_USER_EMAIL,
                password: CRUD_USER_PASSWORD,
                nombreCompleto: CRUD_USER_NAME
            });

            const loginResponse = await request(app).post('/api/auth/login').send({ email: CRUD_USER_EMAIL, password: CRUD_USER_PASSWORD });
            token = loginResponse.body.data.token;

            const user = await User.findOne({ where: { email: CRUD_USER_EMAIL } });
            if (user) newUserId = user.id;
        } catch (e) {
            console.error("Error setting up CRUD user:", e.message);
            token = null;
            newUserId = null;
        }
    });

    // Pruebas de acceso sin token
    test.each([
        ['GET', '/api/users'],
        ['GET', `/api/users/9999`], // ID ficticio
        ['POST', '/api/users'],
        ['PUT', `/api/users/9999`], // ID ficticio
        ['DELETE', `/api/users/9999`] // ID ficticio
    ])('Rutas CRUD fallan sin token (%s %s)', async (method, path) => {
        const req = request(app);
        let response;
        // Seleccionamos la acción correcta según el método HTTP
        if (method === 'GET') response = await req.get(path);
        else if (method === 'POST') response = await req.post(path).send({});
        else if (method === 'PUT') response = await req.put(path).send({});
        else if (method === 'DELETE') response = await req.delete(path);
        else throw new Error("Método HTTP no soportado en la prueba");

        expect(response.statusCode).toBe(401);
        expect(response.body.status).toBe('fail');
    });

    // CRUD Exitoso con Token Válido

    test('GET /api/users - 7: Obtener lista de usuarios (200)', async () => {
        if (!token) throw new Error("Token no disponible para prueba GET /users");
        const response = await request(app)
            .get('/api/users')
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        expect(response.body.status).toBe('success');
        expect(Array.isArray(response.body.data.users)).toBe(true);
        // Debe haber al menos 1 usuario (el de CRUD creado en setup)
        expect(response.body.data.users.length).toBeGreaterThanOrEqual(1);
    });

    test('GET /api/users/:id - 8: Obtener usuario por ID (200)', async () => {
        if (!token || !newUserId) throw new Error("Token o ID de usuario no disponible para prueba GET /users/:id");
        const response = await request(app).get(`/api/users/${newUserId}`).set('Authorization', `Bearer ${token}`).expect(200);
        expect(response.body.status).toBe('success');
        expect(response.body.data.user.id).toBe(newUserId);
    });

     test('PUT /api/users/:id - 9: Actualizar Nombre Propio Exitosamente (200)', async () => {
        if (!token || !newUserId) throw new Error("Token o ID de usuario no disponible para prueba PUT /users/:id");
        const newName = "Usuario CRUD Actualizado";
        const response = await request(app).put(`/api/users/${newUserId}`).set('Authorization', `Bearer ${token}`).send({ nombreCompleto: newName }).expect(200);
        expect(response.body.status).toBe('success');

        // Verificamos el cambio reflejado en la DB
        const check = await User.findByPk(newUserId);
        expect(check.nombreCompleto).toBe(newName);
    });
    test('DELETE /api/users/:id - 10: Eliminar Usuario Propio Exitosamente', async () => {
        if (!token || !newUserId) throw new Error("Token o ID de usuario no disponible para prueba DELETE /users/:id");
        const response = await request(app).delete(`/api/users/${newUserId}`).set('Authorization', `Bearer ${token}`).expect(200);

        expect(response.body.status).toBe('success');

        // Verificamos que el usuario ya no existe en la DB
        const check = await User.findByPk(newUserId);
        expect(check).toBeNull();
    });
});
