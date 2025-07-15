const {
  httpRequestDurationMicroseconds,
  httpRequestsTotal,
} = require("../config/prometheus");

const metricsMiddleware = (req, res, next) => {
  const start = Date.now();
  if (req.path === "/metrics") {
    return next();
  }
  const originalEnd = res.end;
  res.end = function (...args) {
    const duration = Date.now() - start;
    const route = req.route ? req.route.path : req.path;

    httpRequestDurationMicroseconds
      .labels(req.method, route, res.statusCode)
      .observe(duration / 1000);

    httpRequestsTotal.labels(req.method, route, res.statusCode).inc();

    originalEnd.apply(this, args);
  };

  next();
};

module.exports = metricsMiddleware;
