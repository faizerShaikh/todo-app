const promClient = require("prom-client");

// Create a Registry to register the metrics
const register = new promClient.Registry();

register.setDefaultLabels({
  app: "todo-app",
});

// Enable the collection of default metrics
promClient.collectDefaultMetrics({ register });

// Custom metrics for the todo app
const httpRequestDurationMicroseconds = new promClient.Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.1, 5, 15, 50, 100, 200, 300, 400, 500, 1000],
});

const httpRequestsTotal = new promClient.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status_code"],
});

const activeTodos = new promClient.Gauge({
  name: "active_todos",
  help: "Number of active (non-completed) todos",
});

const totalTodos = new promClient.Gauge({
  name: "total_todos",
  help: "Total number of todos",
});

// Register the custom metrics
register.registerMetric(httpRequestDurationMicroseconds);
register.registerMetric(httpRequestsTotal);
register.registerMetric(activeTodos);
register.registerMetric(totalTodos);

module.exports = {
  register,
  httpRequestDurationMicroseconds,
  httpRequestsTotal,
  activeTodos,
  totalTodos,
};
