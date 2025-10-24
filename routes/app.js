
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const createError = require('http-errors');

const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');

const { initDB } = require('../models');
const {router: authRouter} = require('./auth');
const usersRouter = require('./users');

let app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '..', 'public')));

// Inicializar Sequelize (authenticate + sync)
async function initializeSequelize() {
    try {
        await initDB({ sync: true });
    } catch (err) {
        console.error('No se pudo inicializar Sequelize:', err);
        process.exit(1);
    }
}

initializeSequelize();

app.use('/api/auth', authRouter); 
app.use('/api/users', usersRouter); 

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


// Configuración de Swagger
const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'API Documentation',
            version: '1.0.0',
            description: 'API para gestión de usuarios y autenticación'
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Servidor de desarrollo'
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


module.exports = {app}
