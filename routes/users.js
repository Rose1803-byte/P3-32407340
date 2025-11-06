const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

const { User } = require('../models');
const { authenticateToken } = require('./auth');

router.use(authenticateToken);

const cleanUserData = (user) => {
    if (!user) return null;
    const u = user.toJSON ? user.toJSON() : user;
    const { password, ...cleanedUser } = u;
    return cleanedUser;
};

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - email
 *         - password
 *         - nombreCompleto
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único del usuario
 *         email:
 *           type: string
 *           format: email
 *           description: Email del usuario
 *         nombreCompleto:
 *           type: string
 *           description: Nombre completo del usuario
 *         password:
 *           type: string
 *           description: Contraseña del usuario (solo para creación/actualización)
 *       example:
 *         id: 1
 *         email: usuario@ejemplo.com
 *         nombreCompleto: Juan Pérez
 *     
 *     UserResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           enum: [success, fail, error]
 *         data:
 *           type: object
 *         message:
 *           type: string
 *
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Obtiene la lista de todos los usuarios
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuarios obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     users:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/User'
 *                 message:
 *                   type: string
 *                   example: Lista de usuarios obtenida exitosamente.
 *       401:
 *         description: Token de autenticación inválido o faltante
 *       500:
 *         description: Error interno del servidor
 */
router.get('/', async (req, res) => {
    try {
        const users = await User.findAll({ attributes: ['id', 'email', 'nombreCompleto'] });
        const cleanedUsers = users.map(u => cleanUserData(u));
        res.status(200).json({ status: 'success', data: { users: cleanedUsers }, message: 'Lista de usuarios obtenida exitosamente.' });
    } catch (e) {
        console.error(e);
        res.status(500).json({ status: 'error', message: 'Error interno en el servidor.' });
    }
});

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Obtiene un usuario específico por su ID
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID único del usuario
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Usuario obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                 message:
 *                   type: string
 *                   example: Usuario obtenido exitosamente.
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: fail
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: Usuario no encontrado.
 *       401:
 *         description: Token de autenticación inválido o faltante
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findByPk(userId, { attributes: ['id', 'email', 'nombreCompleto', 'password'] });
        if (!user) return res.status(404).json({ status: 'fail', data: { message: 'Usuario no encontrado.' } });
        res.status(200).json({ status: 'success', data: { user: cleanUserData(user) }, message: 'Usuario obtenido exitosamente.' });
    } catch (e) {
        console.error(e);
        res.status(500).json({ status: 'error', message: 'Error interno en el servidor.' });
    }
});

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Crea un nuevo usuario
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - nombreCompleto
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email único del usuario
 *                 example: nuevo@ejemplo.com
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 description: Contraseña del usuario
 *                 example: miPassword123
 *               nombreCompleto:
 *                 type: string
 *                 description: Nombre completo del usuario
 *                 example: María González
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 2
 *                     email:
 *                       type: string
 *                       example: nuevo@ejemplo.com
 *                     nombreCompleto:
 *                       type: string
 *                       example: María González
 *                 message:
 *                   type: string
 *                   example: Usuario creado exitosamente.
 *       400:
 *         description: Datos requeridos faltantes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: fail
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: Email, contraseña y nombre completo son requeridos.
 *       409:
 *         description: El email ya está registrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: fail
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: El email ya está registrado.
 *       401:
 *         description: Token de autenticación inválido o faltante
 *       500:
 *         description: Error interno del servidor
 */
router.post('/', async (req, res) => {
    try {
        const { email, password, nombreCompleto } = req.body;
        if (!email || !password || !nombreCompleto) return res.status(400).json({ status: 'fail', data: { message: 'Email, contraseña y nombre completo son requeridos.' } });
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({ email, password: hashedPassword, nombreCompleto });
        res.status(201).json({ status: 'success', data: { id: newUser.id, email: newUser.email, nombreCompleto: newUser.nombreCompleto }, message: 'Usuario creado exitosamente.' });
    } catch (e) {
        if (e.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ status: 'fail', data: { message: 'El email ya está registrado.' } });
        }
        console.error(e);
        res.status(500).json({ status: 'error', message: 'Error interno en el servidor.' });
    }
});

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Actualiza un usuario existente
 *     description: Solo el propio usuario puede actualizar su perfil
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID único del usuario a actualizar
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Nuevo email del usuario (opcional)
 *                 example: nuevoemail@ejemplo.com
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 description: Nueva contraseña del usuario (opcional)
 *                 example: nuevaPassword123
 *               nombreCompleto:
 *                 type: string
 *                 description: Nuevo nombre completo del usuario (opcional)
 *                 example: Juan Carlos Pérez
 *     responses:
 *       200:
 *         description: Usuario actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                 message:
 *                   type: string
 *                   example: Usuario actualizado exitosamente.
 *       403:
 *         description: No tienes permisos para actualizar este usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: fail
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: No tienes permiso para actualizar este perfil.
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: fail
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: Usuario no encontrado para actualizar.
 *       409:
 *         description: El nuevo email ya está en uso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: fail
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: El nuevo email ya está en uso.
 *       401:
 *         description: Token de autenticación inválido o faltante
 *       500:
 *         description: Error interno del servidor
 */
router.put('/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        const { email, password, nombreCompleto } = req.body;
        // Primero verificar que el usuario a actualizar exista
        const user = await User.findByPk(userId);
        if (!user) return res.status(404).json({ status: 'fail', data: { message: 'Usuario no encontrado para actualizar.' } });

        // Luego verificar permisos (solo el propio usuario puede actualizar su perfil)
        if (parseInt(userId) !== req.user.id) return res.status(403).json({ status: 'fail', data: { message: 'No tienes permiso para actualizar este perfil.' } });

        if (email) user.email = email;
        if (nombreCompleto) user.nombreCompleto = nombreCompleto;
        if (password) user.password = await bcrypt.hash(password, 10);

        await user.save();

        res.status(200).json({ status: 'success', data: { user: cleanUserData(user) }, message: 'Usuario actualizado exitosamente.' });
    } catch (e) {
        // Manejar errores esperados (como violación de unicidad) sin spamear la consola
        if (e.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ status: 'fail', data: { message: 'El nuevo email ya está en uso.' } });
        }

        console.error(e);
        res.status(500).json({ status: 'error', message: 'Error interno en el servidor.' });
    }
});

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Elimina un usuario
 *     description: Solo el propio usuario puede eliminar su cuenta
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID único del usuario a eliminar
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Usuario eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   nullable: true
 *                   example: null
 *                 message:
 *                   type: string
 *                   example: Usuario eliminado exitosamente.
 *       403:
 *         description: No tienes permisos para eliminar este usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: fail
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: No tienes permiso para eliminar este perfil.
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: fail
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: Usuario no encontrado para eliminar.
 *       401:
 *         description: Token de autenticación inválido o faltante
 *       500:
 *         description: Error interno del servidor
 */
router.delete('/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        // Primero verificar existencia
        const user = await User.findByPk(userId);
        if (!user) return res.status(404).json({ status: 'fail', data: { message: 'Usuario no encontrado para eliminar.' } });

        // Luego permisos
        if (parseInt(userId) !== req.user.id) return res.status(403).json({ status: 'fail', data: { message: 'No tienes permiso para eliminar este perfil.' } });

        await user.destroy();

        res.status(200).json({ status: 'success', data: null, message: 'Usuario eliminado exitosamente.' });
    } catch (e) {
        console.error(e);
        res.status(500).json({ status: 'error', message: 'Error interno en el servidor.' });
    }
});

module.exports = router;
