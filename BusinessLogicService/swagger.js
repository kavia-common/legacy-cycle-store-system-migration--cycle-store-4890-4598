const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Business Logic REST API',
      version: '1.0.0',
      description: 'REST API for inventory, sales, customers, and support orchestration.',
    },
    tags: [
      { name: 'Inventory', description: 'Inventory management endpoints' },
      { name: 'Sales', description: 'Sales processing endpoints' },
      { name: 'Customers', description: 'Customer management endpoints' },
      { name: 'Support', description: 'Support ticket endpoints' },
    ],
  },
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec;
