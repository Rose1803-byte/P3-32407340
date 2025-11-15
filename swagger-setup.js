// swagger-setup.js

const swaggerJSDoc = require('swagger-jsdoc');

// Definición de Swagger (Opciones)
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'API de Cómics (Proyecto 3)',
    version: '1.0.0',
    description: 'API RESTful para gestionar usuarios y cómics, implementando JWT, Sequelize y JSend.',
    contact: {
      name: 'Roselin Rengel',
      email: 'roselin.rengel@gmail.com',
    },
  },
  servers: [
    {
      url: 'http://localhost:3000/api',
      description: 'Servidor de Desarrollo Local',
    },
    {
      url: 'https://p3-32407340.onrender.com/api',
      description: 'Servidor de Producción (Render)',
    },
  ],
  // Componentes de seguridad (para JWT)
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
};

// Opciones para swagger-jsdoc
const options = {
  swaggerDefinition,
  // Ruta a los archivos donde están tus anotaciones de Swagger
  apis: ['./routes/*.js', './models/*.js', './docs/**/*.yaml'], 
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;