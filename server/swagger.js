import swaggerJsdoc from 'swagger-jsdoc';
import { fileURLToPath } from 'node:url';

// Absolute path so docs load no matter which folder the server is started from.
// swagger-jsdoc expects forward slashes, even on Windows.
const toGlobPath = (file) => fileURLToPath(new URL(file, import.meta.url)).replace(/\\/g, '/');

const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Calculator API',
      version: '1.0.0',
      description: 'Simple calculator backend for learning purposes',
    },
  },
  // Files scanned for @openapi comment blocks; add new route files here
  apis: [toGlobPath('./app.js')],
});

export default swaggerSpec;
