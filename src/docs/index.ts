import swagger from 'swagger-ui-express';
import Router from 'express';

import schemas from './schemas';
import paths from './paths';

const { serve, setup } = swagger;

const swaggerRouter = Router();
const options = {
  openapi: '3.0.0',
  info: {
    title: 'assignment-sub-platform-backend',
    version: '1.0.0',
    description:
      'This is the API documentation for the routes and endpoint for the assignment-sub-platform-backend.',
    contact: {
      name: 'AmaliTech',
      'x-github': 'https://github.com/AmaliTech-Training-Rw/assignment-sub-platform-backend'
    }
  },
  api: `http://localhost:5000`,
  components: {
    schemas,
    securitySchemes: {
      bearerAuth: {
        type: 'apiKey',
        name: 'authorization',
        in: 'header',
        description:
          "Bearer token should be included in the Authorization header with the 'Bearer' prefix. Example: 'Bearer YOUR_ACCESS_TOKEN'"
      }
    }
  },
  security: [{ bearerAuth: [] }],
  paths
};

swaggerRouter.use('/api-docs', serve, setup(options));

export default swaggerRouter;
