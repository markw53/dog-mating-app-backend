import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Waggle API",
      version: "1.0.0",
      description: "API documentation for Waggle",
      contact: {
        name: "API Support",
        email: "your-email@example.com"
      }
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 5000}`,
        description: "Development server"
      }
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      }
    },
    security: [
      {
        BearerAuth: []
      }
    ]
  },
  apis: ["./src/routes/*.ts"] // Path to the API routes
};

export const specs = swaggerJsdoc(options);
