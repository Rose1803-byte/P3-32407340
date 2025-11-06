
const { JWT_SECRET } = require('../app'); 
const jwt = require('jsonwebtoken');


const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Formato "Bearer TOKEN"

    if (token == null) {
        // No se proporcionó token
        return res.status(401).json({ 
            status: "fail", 
            data: { message: "Acceso denegado. Se requiere token." } 
        });
    }

    jwt.verify(token, JWT_SECRET, (err, userPayload) => {
        if (err) {
            // Token inválido o expirado
            return res.status(403).json({ 
                status: "fail", 
                data: { message: "Token inválido o expirado." } 
            });
        }

        // Token válido. Adjuntamos el payload (que contiene id y email) a req.user
        req.user = userPayload; 
        next(); // Continuar a la ruta protegida
    });
};

module.exports = authenticateToken;