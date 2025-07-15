const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");
const morgan = require("morgan");

// Import routes and middleware
const todoRoutes = require("./routes/todoRoutes");
const errorHandler = require("./middleware/errorHandler");
// const metricsMiddleware = require("./middleware/metrics");
// const { register } = require("./config/prometheus");

const app = express();
const PORT = process.env.PORT || 3000;

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Todo App API",
      version: "1.0.0",
      description: "A simple REST API for managing todo items",
      contact: {
        name: "API Support",
        email: "support@todoapp.com",
      },
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: "Development server",
      },
    ],
    components: {
      schemas: {
        Todo: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              description: "Unique identifier for the todo",
            },
            title: {
              type: "string",
              description: "Title of the todo item",
            },
            completed: {
              type: "boolean",
              description: "Completion status of the todo",
            },
          },
          required: ["title"],
        },
        Error: {
          type: "object",
          properties: {
            error: {
              type: "string",
              description: "Error message",
            },
            status: {
              type: "integer",
              description: "HTTP status code",
            },
            timestamp: {
              type: "string",
              format: "date-time",
              description: "Error timestamp",
            },
          },
        },
      },
    },
  },
  apis: ["./routes/*.js", "./server.js"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(morgan("dev")); // HTTP request logging
// app.use(metricsMiddleware); // Prometheus metrics middleware

// Serve Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// // Prometheus metrics endpoint
// app.get("/metrics", async (req, res) => {
//   try {
//     res.set("Content-Type", register.contentType);
//     res.end(await register.metrics());
//   } catch (err) {
//     res.status(500).end(err);
//   }
// });

// Routes
app.use("/todos", todoRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Todo App API",
    version: "1.0.0",
    documentation: "/api-docs",
    health: "/health",
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    status: 404,
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Todo app listening at http://localhost:${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
  console.log(`💚 Health Check: http://localhost:${PORT}/health`);
  console.log(`📊 Prometheus Metrics: http://localhost:${PORT}/metrics`);
});
