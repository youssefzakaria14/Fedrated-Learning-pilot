
const swaggerJsdoc = require("swagger-jsdoc");

const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Federated Learning API",
            version: "1.0.0",
            description:
                "API documentation for the Federated Learning project, including hospital management, AI predictions, and dashboard results."
        },
        servers: [
            {
                url: "http://localhost:3000",
                description: "Local development server"
            }
        ],
        tags: [
            {
                name: "Hospitals",
                description: "Manage hospitals participating in the project"
            },
            {
                name: "Prediction",
                description: "AI survival prediction endpoints"
            },
            {
                name: "Dashboard",
                description: "Training metrics and dashboard data"
            }
        ]
    },
    apis: ["./Routes/*.js", "./Controllers/*.js"]
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

module.exports = swaggerSpec;
