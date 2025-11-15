// middleware/auth.middleware.js (Código 100% Corregido)

const jwt = require('jsonwebtoken');
// 1. IMPORTA DE config.js (el archivo)
const { JWT_SECRET } = require('../config');
// 2. IMPORTA DE helpers.js (BASADO EN TU CAPTURA)
const { handleResponse } = require('../utils/helpers');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    // Usa el helper
    return handleResponse(res, 401, "Acceso denegado. Se requiere token.");
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      // Usa el helper
      return handleResponse(res, 403, "Token inválido o expirado.");
    }
    req.user = user;
    next();
  });
};

module.exports = { authenticateToken };