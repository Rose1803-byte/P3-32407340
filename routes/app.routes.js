const express = require('express');
const router = express.Router();

/**
 * @route GET /api/ping
 * @description Endpoint para verificar que el servidor está funcionando
 * @access Public
 */
router.get('/ping', (req, res) => {
  // Respuesta en el formato esperado por las pruebas (Task 0)
  res.status(200).json({ status: 'ok' });
});

/**
 * @route GET /api/about
 * @description Información sobre la API
 * @access Public
 */
router.get('/about', (req, res) => {
  // Devolver los datos del alumno en formato JSend (esperado por las pruebas)
  res.status(200).json({
    status: 'success',
    data: {
      nombreCompleto: 'ROSELYN SABRINA BOLIVAR MEDINA',
      cedula: '32407340',
      seccion: '2'
    }
  });
});

module.exports = router;