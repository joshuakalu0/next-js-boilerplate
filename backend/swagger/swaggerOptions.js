const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Boilerplate API',
      version: '1.0.0',
      description: 'API documentation for authentication and user management',
    },
    servers: [
      {
        url: 'http://localhost:5000',
      },
    ],
  },
  apis: ['./routes/*.js'], // Scan route files for Swagger comments
};

module.exports = options;
