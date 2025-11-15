// routes/app.js (¡Corregido!)

const express = require('express');
const router = express.Router();

// ¡¡BORRAMOS LA LÍNEA QUE IMPORTABA LOS MODELOS (Línea 21)!!

// --- Rutas Base (Task 0) ---
// (Las movimos aquí desde tu app.js)
router.get('/ping', (req, res) => res.status(200).json({ status: 'ok' }));

router.get('/about', (req, res) => {
  res.json({
    status: "success",
    data: {
      nombreCompleto: "ROSELYN SABRINA BOLIVAR MEDINA",
      cedula: "32407340",
      seccion: "2"
    }
  });
});

module.exports = router;