const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcryptLib = require('bcryptjs');
// bcryptjs uses callbacks; wrap hash/compare to return Promises so existing async/await code continues working
const bcrypt = {
    hash: (s, salt) => new Promise((res, rej) => bcryptLib.hash(s, salt, (err, hash) => err ? rej(err) : res(hash))),
    compare: (s, hash) => new Promise((res, rej) => bcryptLib.compare(s, hash, (err, ok) => err ? rej(err) : res(ok))),
    ...bcryptLib
};

const { User } = require('../models');
// Evitar dependencia circular: leer el secreto desde variables de entorno
const JWT_SECRET = process.env.JWT_SECRET || 'tu_clave_secreta_muy_segura';

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    // El token viene en formato "Bearer [token]"
    const token = authHeader && authHeader.split(' ')[1]; 

    if (token == null) {
    
        return res.status(401).json({ 
            status: "fail",
            data: {
                message: "Token no proporcionado. Acceso denegado."
            }
        });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
      
            return res.status(403).json({ 
                status: "fail",
                data: {
                    message: "Token inválido o expirado."
                }
            });
        }
        
       
        req.user = user; 
        next();
    });
};

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registrar un nuevo usuario
 *     description: Crea una nueva cuenta de usuario con email, contraseña y nombre completo
 *     tags: [Autenticación]
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
 *                 description: Email del usuario (debe ser único)
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 description: Contraseña del usuario
 *               nombreCompleto:
 *                 type: string
 *                 description: Nombre completo del usuario
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
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
 *                       description: ID único del usuario
 *                     email:
 *                       type: string
 *                       description: Email del usuario
 *                     nombreCompleto:
 *                       type: string
 *                       description: Nombre completo del usuario
 *                 message:
 *                   type: string
 *                   example: Usuario registrado exitosamente.
 *       400:
 *         description: Datos faltantes o inválidos
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
 *         description: Email ya registrado
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
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Error interno en el servidor.
 */
router.post('/register', async (req, res) => {
    try {
        const { email, password, nombreCompleto } = req.body;

        if (!email || !password || !nombreCompleto) {
            return res.status(400).json({ 
                status: 'fail', 
                data: { message: 'Email, contraseña y nombre completo son requeridos.' } 
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            email,
            password: hashedPassword,
            nombreCompleto
        });

        res.status(201).json({
            status: 'success',
            data: {
                id: newUser.id,
                email: newUser.email,
                nombreCompleto: newUser.nombreCompleto
            },
            message: 'Usuario registrado exitosamente.'
        });

    } catch (e) {
      
        // Sequelize unique constraint error handling
        if (e.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ 
                status: 'fail', 
                data: { message: 'El email ya está registrado.' } 
            });
        }
        console.error(e);
        res.status(500).json({ status: 'error', message: 'Error interno en el servidor.' });
    }
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     description: Autentica al usuario y devuelve un token JWT
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email del usuario
 *               password:
 *                 type: string
 *                 description: Contraseña del usuario
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso
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
 *                     token:
 *                       type: string
 *                       description: Token JWT para autenticación
 *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 message:
 *                   type: string
 *                   example: Inicio de sesión exitoso.
 *       400:
 *         description: Datos faltantes
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
 *                       example: Email y contraseña son requeridos.
 *       401:
 *         description: Credenciales inválidas
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
 *                       example: Credenciales inválidas.
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Error interno en el servidor.
 */
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        
        if (!email || !password) {
            return res.status(400).json({ 
                status: 'fail', 
                data: { message: 'Email y contraseña son requeridos.' } 
            });
        }

       
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(401).json({ status: 'fail', data: { message: 'Credenciales inválidas.' } });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({ status: 'fail', data: { message: 'Credenciales inválidas.' } });
        }

        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });

      
        res.status(200).json({
            status: 'success',
            data: {
                token: token
            },
            message: 'Inicio de sesión exitoso.'
        });

    } catch (e) {
        console.error(e);
        res.status(500).json({ status: 'error', message: 'Error interno en el servidor.' });
    }
});

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Obtener perfil del usuario autenticado
 *     description: Devuelve los datos del perfil del usuario que está autenticado
 *     tags: [Autenticación]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Datos del perfil obtenidos exitosamente
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
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           description: ID único del usuario
 *                         email:
 *                           type: string
 *                           description: Email del usuario
 *                         nombreCompleto:
 *                           type: string
 *                           description: Nombre completo del usuario
 *                 message:
 *                   type: string
 *                   example: Datos del perfil obtenidos exitosamente.
 *       401:
 *         description: Token no proporcionado
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
 *                       example: Token no proporcionado. Acceso denegado.
 *       403:
 *         description: Token inválido o expirado
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
 *                       example: Token inválido o expirado.
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
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Error interno en el servidor.
 */
router.get('/me', authenticateToken, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: ['id', 'email', 'nombreCompleto']
        });

        if (!user) {
            return res.status(404).json({ status: 'fail', data: { message: 'Usuario no encontrado.' } });
        }

        res.status(200).json({ status: 'success', data: { user }, message: 'Datos del perfil obtenidos exitosamente.' });
        
    } catch (e) {
        console.error(e);
        res.status(500).json({ status: 'error', message: 'Error interno en el servidor.' });
    }
});

module.exports = {router, authenticateToken};