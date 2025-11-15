// routes/auth.js (FINALMENTE CORREGIDO)

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// 1. Importar la configuración central (¡AQUÍ ESTÁ LA CLAVE!)
const { JWT_SECRET } = require('../config'); 

// 2. Importar modelos (Dispara la carga de la BD)
const { User } = require('../models'); 

// Middleware de utilidad (asumimos que existe)
// Nota: Puedes importar handleResponse aquí si lo usas en el middleware
// const { handleResponse } = require('../utils/helpers'); 


// Nota: El middleware authenticateToken debe estar exportado para ser usado en otros routers
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; 

    if (token == null) {
        // Asumo que usas un helper o la respuesta directa aquí:
        return res.status(401).json({ status: "fail", data: { message: "Token no proporcionado. Acceso denegado." } });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => { 
        if (err) {
            return res.status(403).json({ status: "fail", data: { message: "Token inválido o expirado." } });
        }
        
        req.user = user; 
        next();
    });
};

// ... (TU SWAGGER DOCS A PARTIR DE AQUÍ) ...

// --- RUTA /register ---
router.post('/register', async (req, res) => {
    try {
        const { email, password, nombreCompleto } = req.body;
        // ... (Tu lógica de validación) ...
        
        // El resto de tu lógica es correcta.
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            email,
            password: hashedPassword,
            nombreCompleto
        });

        res.status(201).json({
            status: 'success',
            data: { id: newUser.id, email: newUser.email, nombreCompleto: newUser.nombreCompleto },
            message: 'Usuario registrado exitosamente.'
        });

    } catch (e) {
        if (e.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ status: 'fail', data: { message: 'El email ya está registrado.' } });
        }
        console.error(e);
        res.status(500).json({ status: 'error', message: 'Error interno en el servidor.' });
    }
});

// --- RUTA /login ---
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        // ... (Tu lógica de validación) ...

        const user = await User.findOne({ where: { email } });
        // ... (Tu lógica de comparación de contraseña) ...
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({ status: 'fail', data: { message: 'Credenciales inválidas.' } });
        }

        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({
            status: 'success',
            data: { token: token },
            message: 'Inicio de sesión exitoso.'
        });

    } catch (e) {
        console.error(e);
        res.status(500).json({ status: 'error', message: 'Error interno en el servidor.' });
    }
});

// --- RUTA /me ---
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


// Exportar el router como valor principal para que `require('./auth.routes')`
// devuelva directamente el Router (evita el error "Router.use() requires a middleware function but got a Object").
module.exports = router;
// También exponer el middleware como propiedad del export (funciona con destructuring)
module.exports.authenticateToken = authenticateToken;