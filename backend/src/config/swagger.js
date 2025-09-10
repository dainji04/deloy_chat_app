const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Chat App API',
            version: '1.0.0',
            description: 'Real-time chat application API documentation',
            contact: {
                name: 'Developer',
                email: 'developer@chatapp.com',
            },
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Development server',
            },
            {
                url: 'https://your-production-url.com',
                description: 'Production server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Enter JWT token in format: Bearer <token>',
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
        tags: [
            {
                name: 'Auth',
                description: 'Authentication endpoints',
            },
            {
                name: 'Users',
                description: 'User management endpoints',
            },
            {
                name: 'Friends',
                description: 'Friend management endpoints',
            },
            {
                name: 'Groups',
                description: 'Group chat management endpoints',
            },
            {
                name: 'Messages',
                description: 'Message and conversation endpoints',
            },
        ],
    },
    apis: ['./src/routes/*.js'], // Đường dẫn đến file routes
};

const specs = swaggerJSDoc(options);

module.exports = {
    specs,
    swaggerUi,
};
