const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Business Logic REST API',
      version: '1.0.0',
      description: 'RESTful API for managing inventory, sales, customers, and support tickets. Secured with JWT authentication.',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
    tags: [
      { name: 'Health', description: 'Service health and readiness' },
      { name: 'Inventory', description: 'Inventory management endpoints' },
      { name: 'Sales', description: 'Sales processing endpoints' },
      { name: 'Customers', description: 'Customer management endpoints' },
      { name: 'Support', description: 'Support ticket endpoints' },
    ],
  },
  apis: ['./src/routes/*.js'], // Path to the API docs
};

const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec;
