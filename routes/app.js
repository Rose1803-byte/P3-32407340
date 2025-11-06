// app.js

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const createError = require('http-errors');

const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');

// Asumo que estas rutas existen en tu estructura:
const { initDB } = require('../models');
const { router: authRouter } = require('./auth');
const usersRouter = require('./users');

// --- Nuevas Rutas (Task 2) ---
const categoryRouter = require('./category.routes');
const tagRouter = require('./tag.routes');
const productRouter = require('./product.routes');
const productPublicRouter = require('./productPublic.routes');

let app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '..', 'public')));

// Nota: la inicialización de Sequelize se delega a quien arranque el servidor
// (por ejemplo bin/www) para evitar sincronizaciones automáticas durante los tests.


// --- Montaje de Rutas ---
app.use('/api/auth', authRouter); 
app.use('/api/users', usersRouter);
// Montaje de las nuevas rutas Task 2
app.use('/api/categories', categoryRouter);
app.use('/api/tags', tagRouter);
app.use('/api/products', productRouter);
// Ruta pública para Self-Healing y listado público
app.use('/p', productPublicRouter);


// --- Rutas Base (Task 0) ---
app.get('/ping', (req, res) => res.status(200).json({ status: 'ok' }));
app.get('/about', (req, res) => {
    res.json({
        status: "success",
        data: {
            nombreCompleto: "ROSELYN SABRINA BOLIVAR MEDINA",
            cedula: "32407340",
            seccion: "2"
        }
    });
});


// --- Configuración de Swagger ---
const swaggerOptions = {
    // ... (Tu objeto de configuración Swagger original)
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'API Documentation (Task 2)',
            version: '2.0.0',
            description: 'API para gestión de usuarios y productos (Zapatillas Deportivas)'
        },
        // ... (Añadir la URL para la ruta Self-Healing)
        servers: [
            {
                url: '/api',
                description: 'Servidor de API principal'
            },
            {
                url: '/p',
                description: 'Ruta pública de Self-Healing'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Ingrese el token JWT en el formato: Bearer <token>'
                }
            }
        }
    },
    apis: ['./routes/*.js'], // archivos que contienen las definiciones de la API
};

const swaggerSpecs = swaggerJSDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));


// --- Manejo de Errores ---
app.use(function(req, res, next) {
    res.status(404).json({
        status: "fail",
        data: { message: `Ruta no encontrada: ${req.originalUrl}` }
    });
});


app.use(function(err, req, res, next) {
    console.error("Error no manejado:", err); 
    const status = err.status || 500;
    res.status(status).json({
        status: 'error',
        message: err.message || 'Error interno del servidor',
        
        stack: req.app.get('env') === 'development' ? err.stack : undefined
    });
});


module.exports = {app, initDB}