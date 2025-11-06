// __tests__/users.test.js
const request = require('supertest');
const app = require('../app');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { initDB, sequelize, User } = require('../models');

// Datos de prueba consistentes con el modelo de User
const TEST_USER_1 = {
    email: "test.user1@example.com",
    password: "Password123!",
    nombreCompleto: "Usuario de Prueba Uno"
};

const TEST_USER_2 = {
    email: "test.user2@example.com", 
    password: "Password456!",
    nombreCompleto: "Usuario de Prueba Dos"
};


// SETUP: Inicializar y limpiar la base de datos antes de todas las pruebas

beforeAll(async () => {
    try {
        // Usar initDB con force para asegurar limpieza en tests
        await initDB({ sync: true, force: true });
    } catch (e) {
        console.error('Error in beforeAll initDB:', e.message);
        throw e;
    }
});

afterAll(async () => {
    try {
        await sequelize.close();
    } catch (e) {
        // ignorar
    }
});


// PRUEBAS PARA EL CRUD DE USUARIOS (/api/users)


describe('CRUD de Usuarios (/api/users)', () => {
    let token1, token2;
    let user1Id, user2Id;

    beforeAll(async () => {
        // Crear usuarios de prueba y obtener tokens
        try {
            // Registrar primer usuario
            const registerResponse1 = await request(app)
                .post('/api/auth/register')
                .send(TEST_USER_1);
            user1Id = registerResponse1.body.data.id;

            const loginResponse1 = await request(app)
                .post('/api/auth/login')
                .send({ email: TEST_USER_1.email, password: TEST_USER_1.password });
            token1 = loginResponse1.body.data.token;

            // Registrar segundo usuario
            const registerResponse2 = await request(app)
                .post('/api/auth/register')
                .send(TEST_USER_2);
            user2Id = registerResponse2.body.data.id;

            const loginResponse2 = await request(app)
                .post('/api/auth/login')
                .send({ email: TEST_USER_2.email, password: TEST_USER_2.password });
            token2 = loginResponse2.body.data.token;
        } catch (e) {
            console.error("Error setting up test users:", e.message);
            throw e;
        }
    });


    // PRUEBAS DE AUTORIZACIÓN - Sin token

    describe('Autorización - Sin token', () => {
        test('GET /api/users - Sin token (401)', async () => {
            const response = await request(app)
                .get('/api/users')
                .expect('Content-Type', /json/)
                .expect(401);

            expect(response.body.status).toBe('fail');
        });

        test('GET /api/users/:id - Sin token (401)', async () => {
            const response = await request(app)
                .get(`/api/users/${user1Id}`)
                .expect('Content-Type', /json/)
                .expect(401);

            expect(response.body.status).toBe('fail');
        });

        test('POST /api/users - Sin token (401)', async () => {
            const response = await request(app)
                .post('/api/users')
                .send({
                    email: "new@example.com",
                    password: "NewPassword123",
                    nombreCompleto: "Nuevo Usuario"
                })
                .expect('Content-Type', /json/)
                .expect(401);

            expect(response.body.status).toBe('fail');
        });

        test('PUT /api/users/:id - Sin token (401)', async () => {
            const response = await request(app)
                .put(`/api/users/${user1Id}`)
                .send({ nombreCompleto: "Nombre Actualizado" })
                .expect('Content-Type', /json/)
                .expect(401);

            expect(response.body.status).toBe('fail');
        });

        test('DELETE /api/users/:id - Sin token (401)', async () => {
            const response = await request(app)
                .delete(`/api/users/${user1Id}`)
                .expect('Content-Type', /json/)
                .expect(401);

            expect(response.body.status).toBe('fail');
        });
    });

   
    // PRUEBAS GET - Obtener usuarios
    
    describe('GET /api/users - Obtener lista de usuarios', () => {
        test('Obtener lista exitosamente (200)', async () => {
            const response = await request(app)
                .get('/api/users')
                .set('Authorization', `Bearer ${token1}`)
                .expect('Content-Type', /json/)
                .expect(200);

            expect(response.body.status).toBe('success');
            expect(response.body.message).toBe('Lista de usuarios obtenida exitosamente.');
            expect(Array.isArray(response.body.data.users)).toBe(true);
            expect(response.body.data.users.length).toBeGreaterThanOrEqual(2);

            // Verificar que no se incluye la contraseña
            response.body.data.users.forEach(user => {
                expect(user.password).toBeUndefined();
                expect(user.id).toBeDefined();
                expect(user.email).toBeDefined();
                expect(user.nombreCompleto).toBeDefined();
            });
        });

        test('Token con formato válido obtiene lista correctamente', async () => {
            const response = await request(app)
                .get('/api/users')
                .set('Authorization', `Bearer ${token2}`)
                .expect('Content-Type', /json/)
                .expect(200);

            expect(response.body.status).toBe('success');
            expect(response.body.message).toBe('Lista de usuarios obtenida exitosamente.');
            expect(Array.isArray(response.body.data.users)).toBe(true);
            
            // Verificar estructura de los datos
            if (response.body.data.users.length > 0) {
                const user = response.body.data.users[0];
                expect(user).toHaveProperty('id');
                expect(user).toHaveProperty('email');
                expect(user).toHaveProperty('nombreCompleto');
                expect(user).not.toHaveProperty('password');
            }
        });
    });

    
    // PRUEBAS GET /:id - Obtener usuario específico
    
    describe('GET /api/users/:id - Obtener usuario específico', () => {
        test('Obtener usuario existente exitosamente (200)', async () => {
            const response = await request(app)
                .get(`/api/users/${user1Id}`)
                .set('Authorization', `Bearer ${token1}`)
                .expect('Content-Type', /json/)
                .expect(200);

            expect(response.body.status).toBe('success');
            expect(response.body.message).toBe('Usuario obtenido exitosamente.');
            expect(response.body.data.user.id).toBe(user1Id);
            expect(response.body.data.user.email).toBe(TEST_USER_1.email);
            expect(response.body.data.user.nombreCompleto).toBe(TEST_USER_1.nombreCompleto);
            expect(response.body.data.user.password).toBeUndefined();
        });

        test('Usuario no encontrado (404)', async () => {
            const response = await request(app)
                .get('/api/users/99999')
                .set('Authorization', `Bearer ${token1}`)
                .expect('Content-Type', /json/)
                .expect(404);

            expect(response.body.status).toBe('fail');
            expect(response.body.data.message).toBe('Usuario no encontrado.');
        });
    });

    
    // PRUEBAS POST - Crear usuario

    describe('POST /api/users - Crear usuario', () => {
        test('Crear usuario exitosamente (201)', async () => {
            const newUser = {
                email: "nuevo.usuario@example.com",
                password: "NuevoPassword123!",
                nombreCompleto: "Usuario Completamente Nuevo"
            };

            const response = await request(app)
                .post('/api/users')
                .set('Authorization', `Bearer ${token1}`)
                .send(newUser)
                .expect('Content-Type', /json/)
                .expect(201);

            expect(response.body.status).toBe('success');
            expect(response.body.message).toBe('Usuario creado exitosamente.');
            expect(response.body.data.id).toBeDefined();
            expect(response.body.data.email).toBe(newUser.email);
            expect(response.body.data.nombreCompleto).toBe(newUser.nombreCompleto);
            expect(response.body.data.password).toBeUndefined();

            // Verificar que el usuario fue creado en la base de datos con el modelo correcto
            const createdUser = await User.findByPk(response.body.data.id);
            expect(createdUser).not.toBeNull();
            expect(createdUser.email).toBe(newUser.email);
            expect(createdUser.nombreCompleto).toBe(newUser.nombreCompleto);
            
            // Verificar que la contraseña fue hasheada correctamente con bcrypt
            const passwordMatch = await bcrypt.compare(newUser.password, createdUser.password);
            expect(passwordMatch).toBe(true);

            // Verificar que tiene timestamps (del modelo Sequelize)
            expect(createdUser.createdAt).toBeDefined();
            expect(createdUser.updatedAt).toBeDefined();
        });

        test('Email faltante (400)', async () => {
            const response = await request(app)
                .post('/api/users')
                .set('Authorization', `Bearer ${token1}`)
                .send({
                    password: "Password123",
                    nombreCompleto: "Usuario Sin Email"
                })
                .expect('Content-Type', /json/)
                .expect(400);

            expect(response.body.status).toBe('fail');
            expect(response.body.data.message).toBe('Email, contraseña y nombre completo son requeridos.');
        });

        test('Contraseña faltante (400)', async () => {
            const response = await request(app)
                .post('/api/users')
                .set('Authorization', `Bearer ${token1}`)
                .send({
                    email: "sinpassword@example.com",
                    nombreCompleto: "Usuario Sin Password"
                })
                .expect('Content-Type', /json/)
                .expect(400);

            expect(response.body.status).toBe('fail');
            expect(response.body.data.message).toBe('Email, contraseña y nombre completo son requeridos.');
        });

        test('Nombre completo faltante (400)', async () => {
            const response = await request(app)
                .post('/api/users')
                .set('Authorization', `Bearer ${token1}`)
                .send({
                    email: "sinnombre@example.com",
                    password: "Password123!"
                })
                .expect('Content-Type', /json/)
                .expect(400);

            expect(response.body.status).toBe('fail');
            expect(response.body.data.message).toBe('Email, contraseña y nombre completo son requeridos.');
        });

        test('Email duplicado (409)', async () => {
            const response = await request(app)
                .post('/api/users')
                .set('Authorization', `Bearer ${token1}`)
                .send(TEST_USER_1) // Intentar crear usuario con email existente
                .expect('Content-Type', /json/)
                .expect(409);

            expect(response.body.status).toBe('fail');
            expect(response.body.data.message).toBe('El email ya está registrado.');
        });
    });

    describe('PUT /api/users/:id - Actualizar usuario', () => {
        test('Actualizar propio perfil exitosamente (200)', async () => {
            const updateData = {
                email: "user1.actualizado@example.com",
                nombreCompleto: "Usuario de Prueba Uno Actualizado",
                password: "NewPassword123!"
            };

            const response = await request(app)
                .put(`/api/users/${user1Id}`)
                .set('Authorization', `Bearer ${token1}`)
                .send(updateData)
                .expect('Content-Type', /json/)
                .expect(200);

            expect(response.body.status).toBe('success');
            expect(response.body.message).toBe('Usuario actualizado exitosamente.');
            expect(response.body.data.user.email).toBe(updateData.email);
            expect(response.body.data.user.nombreCompleto).toBe(updateData.nombreCompleto);
            expect(response.body.data.user.password).toBeUndefined();

            // Verificar cambios en la base de datos usando el modelo User
            const updatedUser = await User.findByPk(user1Id);
            expect(updatedUser.email).toBe(updateData.email);
            expect(updatedUser.nombreCompleto).toBe(updateData.nombreCompleto);
            
            // Verificar que la nueva contraseña fue hasheada correctamente con bcrypt
            const passwordMatch = await bcrypt.compare(updateData.password, updatedUser.password);
            expect(passwordMatch).toBe(true);

            // Verificar que updatedAt cambió
            expect(updatedUser.updatedAt).toBeDefined();
        });

        test('Actualizar solo nombre completo (200)', async () => {
            const updateData = {
                nombreCompleto: "Solo Nombre Actualizado"
            };

            const response = await request(app)
                .put(`/api/users/${user2Id}`)
                .set('Authorization', `Bearer ${token2}`)
                .send(updateData)
                .expect('Content-Type', /json/)
                .expect(200);

            expect(response.body.status).toBe('success');
            expect(response.body.data.user.nombreCompleto).toBe(updateData.nombreCompleto);
            expect(response.body.data.user.email).toBe(TEST_USER_2.email); // Email no debe cambiar
        });

        test('Intentar actualizar perfil de otro usuario (403)', async () => {
            const response = await request(app)
                .put(`/api/users/${user2Id}`) // user1 intenta actualizar user2
                .set('Authorization', `Bearer ${token1}`)
                .send({ nombreCompleto: "Intento Malicioso" })
                .expect('Content-Type', /json/)
                .expect(403);

            expect(response.body.status).toBe('fail');
            expect(response.body.data.message).toBe('No tienes permiso para actualizar este perfil.');
        });

        test('Usuario no encontrado para actualizar (404)', async () => {
            const response = await request(app)
                .put('/api/users/99999')
                .set('Authorization', `Bearer ${token1}`)
                .send({ nombreCompleto: "Usuario Inexistente" })
                .expect('Content-Type', /json/)
                .expect(404);

            expect(response.body.status).toBe('fail');
            expect(response.body.data.message).toBe('Usuario no encontrado para actualizar.');
        });

        test('Email duplicado al actualizar (409)', async () => {
            // Intentar actualizar user2 con el email de user1 (ya actualizado)
            const response = await request(app)
                .put(`/api/users/${user2Id}`)
                .set('Authorization', `Bearer ${token2}`)
                .send({ email: "user1.actualizado@example.com" }) // Email que ya existe
                .expect('Content-Type', /json/)
                .expect(409);

            expect(response.body.status).toBe('fail');
            expect(response.body.data.message).toBe('El nuevo email ya está en uso.');
        });
    });

    // =========================================================================
    // PRUEBAS DELETE /:id - Eliminar usuario
    // =========================================================================
    describe('DELETE /api/users/:id - Eliminar usuario', () => {
        test('Intentar eliminar perfil de otro usuario (403)', async () => {
            const response = await request(app)
                .delete(`/api/users/${user2Id}`) // user1 intenta eliminar user2
                .set('Authorization', `Bearer ${token1}`)
                .expect('Content-Type', /json/)
                .expect(403);

            expect(response.body.status).toBe('fail');
            expect(response.body.data.message).toBe('No tienes permiso para eliminar este perfil.');
        });

        test('Usuario no encontrado para eliminar (404)', async () => {
            const response = await request(app)
                .delete('/api/users/99999')
                .set('Authorization', `Bearer ${token1}`)
                .expect('Content-Type', /json/)
                .expect(404);

            expect(response.body.status).toBe('fail');
            expect(response.body.data.message).toBe('Usuario no encontrado para eliminar.');
        });

        test('Eliminar propio perfil exitosamente (200)', async () => {
            const response = await request(app)
                .delete(`/api/users/${user2Id}`)
                .set('Authorization', `Bearer ${token2}`)
                .expect('Content-Type', /json/)
                .expect(200);

            expect(response.body.status).toBe('success');
            expect(response.body.message).toBe('Usuario eliminado exitosamente.');
            expect(response.body.data).toBeNull();

            // Verificar que el usuario fue eliminado de la base de datos
            const deletedUser = await User.findByPk(user2Id);
            expect(deletedUser).toBeNull();
        });
    });

    // =========================================================================
    // PRUEBAS DE SEGURIDAD Y VALIDACIONES DEL MODELO
    // =========================================================================
    describe('Validaciones del modelo User y seguridad', () => {
        test('La función cleanUserData elimina correctamente la contraseña', async () => {
            const response = await request(app)
                .get(`/api/users/${user1Id}`)
                .set('Authorization', `Bearer ${token1}`)
                .expect(200);

            // Verificar que la contraseña no está en la respuesta
            expect(response.body.data.user.password).toBeUndefined();
            expect(response.body.data.user.id).toBeDefined();
            expect(response.body.data.user.email).toBeDefined();
            expect(response.body.data.user.nombreCompleto).toBeDefined();
        });

        test('El modelo User requiere todos los campos obligatorios', async () => {
            // Intentar crear usuario sin email usando directamente el modelo
            try {
                await User.create({
                    password: 'test123',
                    nombreCompleto: 'Test User'
                });
                // Si no falla, el test debe fallar
                expect(true).toBe(false);
            } catch (error) {
                expect(error.name).toBe('SequelizeValidationError');
            }
        });

        test('El modelo valida formato de email correctamente', async () => {
            try {
                await User.create({
                    email: 'email-invalido',
                    password: 'test123',
                    nombreCompleto: 'Test User'
                });
                expect(true).toBe(false);
            } catch (error) {
                expect(error.name).toBe('SequelizeValidationError');
            }
        });

        test('El modelo mantiene la unicidad del email', async () => {
            // Crear primer usuario
            const user1 = await User.create({
                email: 'test.uniqueness@example.com',
                password: 'hashedPassword',
                nombreCompleto: 'Usuario Unicidad'
            });

            // Intentar crear segundo usuario con el mismo email
            try {
                await User.create({
                    email: 'test.uniqueness@example.com',
                    password: 'hashedPassword2',
                    nombreCompleto: 'Usuario Unicidad 2'
                });
                expect(true).toBe(false);
            } catch (error) {
                expect(error.name).toBe('SequelizeUniqueConstraintError');
            }

            // Limpiar
            await user1.destroy();
        });
    });
});