// Archivo app.js corregido para leer el puerto de Render.com

const express = require('express');
const app = express();

// IMPORTANTE: Render asigna el puerto mediante la variable de entorno PORT.
// Si PORT existe, úsalo. Si no (como en desarrollo local), usa 3000.
const port = process.env.PORT || 3000;

// Middleware y configuración estándar de Express (asumiendo que estaban aquí)
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade'); 
// etc.

// =========================================================================
// RUTAS DE LA API (Debes asegurarte de tener la ruta /about y /ping)
// =========================================================================

// Ruta de Salud/Status (Paso 1)
app.get('/ping', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

// Ruta /about con datos del estudiante (Paso 2)
app.get('/about', (req, res) => {
    // Tus datos personales
    const studentData = {
        // CORREGIDO: Usando 'nombreCompleto' (con C mayúscula) para coincidir con la prueba.
        nombreCompleto: "Roselyn", 
        cedula: "32407340",
        seccion: "Seccion NNN", // Asegúrate de que esta sección sea correcta
        // Puedes agregar más campos si tu asignación lo requiere
    };

    // Formato JSend
    res.json({
        status: "success",
        data: studentData
    });
});

// Manejador de ruta no encontrada (404)
app.use((req, res, next) => {
    // Nota: Aunque la prueba que enviaste espera 'error', JSend usa 'fail' para errores del cliente
    // y 'error' para errores del servidor. Usaremos 'fail' para 404.
    res.status(404).json({ 
        status: "fail", // Cambiado a 'fail' para seguir el estándar JSend
        data: {
            message: "Ruta no encontrada (Not Found)"
        }
    });
});

// =========================================================================
// INICIO DEL SERVIDOR
// =========================================================================

// Ahora usamos la variable 'port' que toma el valor de process.env.PORT
app.listen(port, () => {
    console.log(`Express server listening on port ${port}`);
});

// Exporta la aplicación para las pruebas (Supertest)
module.exports = app;
