import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Cafeicultura',
      version: '1.0.0',
      description: 'Documentação dos endpoints do sistema de gestão de cafeicultura.',
    },
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'connect.sid', 
        },
      },
    },
  },
  apis: [
    './src/features/**/*.docs.yaml'
  ], 
};

const swaggerSpec = swaggerJsdoc(options);

const PORT = process.env.PORT || 3333;
const setupSwagger = (app: Express) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log(`Documentação rodando em http://localhost:${PORT}/api-docs`);
}

export default setupSwagger;