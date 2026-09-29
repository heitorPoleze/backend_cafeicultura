import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';
import basicAuth from 'express-basic-auth';
import dotenv from "dotenv";

dotenv.config();

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Sysgrano',
      version: '1.0.5',
      description: 'Documentação dos endpoints do sistema Sysgrano.',
    },
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'x-api-key',
        },
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'connect.sid',
        },
      },
    },
    security: [{ ApiKeyAuth: [] }],
  },
  apis: [
    './src/features/**/*.docs.yaml'
  ],
};


const swaggerSpec = swaggerJsdoc(options);

const PORT = process.env.PORT || 3333;
const setupSwagger = (app: Express) => {
  app.use('/api-docs', basicAuth({
    users: { [process.env.SWAGGER_USER!]: process.env.SWAGGER_PASSWORD! },
    challenge: true,
    unauthorizedResponse: 'Acesso restrito.'
  }), swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log(`Documentação rodando em http://localhost:${PORT}/api-docs`);
}

export default setupSwagger;