import swaggerJSDoc from 'swagger-jsdoc';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: '무빙 API',
    version: '1.0.0',
    description: 'Moving Project API',
  },
  servers: [
    {
      url: '/',
    },
  ],
};
const options = {
  swaggerDefinition,
  apis: ['./src/modules/**/*.ts', './src/schems/**/*.ts'],
};

export const swaggerSpec = swaggerJSDoc(options);
