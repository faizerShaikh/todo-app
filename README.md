# Todo App API

A RESTful API for managing todo items with proper folder structure, Swagger documentation, comprehensive logging, Prometheus metrics, and Dockerized monitoring stack.

## 🚀 Features

- **RESTful API** - Full CRUD operations for todos
- **Swagger Documentation** - Interactive API documentation
- **Morgan Logging** - HTTP request logging
- **Prometheus Metrics** - Application monitoring and metrics
- **Error Handling** - Centralized error management
- **Input Validation** - Data validation utilities
- **Organized Structure** - Clean, scalable folder structure

## 📁 Project Structure

```
todo-app/
├── config/
│   ├── database.js          # Database/file storage configuration
│   └── prometheus.js        # Prometheus metrics configuration
├── controllers/
│   └── todoController.js    # Request/response handling
├── middleware/
│   ├── errorHandler.js      # Error handling middleware
│   └── metrics.js           # Prometheus metrics middleware
├── routes/
│   └── todoRoutes.js        # API route definitions
├── services/
│   └── todoService.js       # Business logic layer
├── utils/
│   └── validation.js        # Validation utilities
├── data.json               # Data storage file
├── server.js               # Main application file
├── docker-compose.yml      # Monitoring stack configuration
├── prometheus.yml          # Prometheus configuration
├── package.json            # Dependencies and scripts
└── README.md              # Project documentation
```

## 🛠️ Installation & Running

### 1. Run the Node.js App (Locally)

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the app in development mode:
   ```bash
   npm run dev
   ```
   Or in production mode:
   ```bash
   npm start
   ```

- The app will be available at: http://localhost:3000

### 2. Run Monitoring Stack (Prometheus & Grafana in Docker)

1. Make sure Docker and Docker Compose are installed
2. Start Prometheus and Grafana:
   ```bash
   docker-compose up -d
   ```
3. Access:
   - **Prometheus**: http://localhost:9090
   - **Grafana**: http://localhost:3001 (admin/admin)

> **Note:** Your Node.js app must be running locally for Prometheus to scrape metrics from it.

## 📚 API Documentation

Once the server is running, visit:

- **Swagger UI**: http://localhost:3000/api-docs
- **Health Check**: http://localhost:3000/health
- **Prometheus Metrics**: http://localhost:3000/metrics
- **API Root**: http://localhost:3000/

## 🔗 API Endpoints

| Method | Endpoint     | Description           |
| ------ | ------------ | --------------------- |
| GET    | `/todos`     | Get all todos         |
| POST   | `/todos`     | Create a new todo     |
| GET    | `/todos/:id` | Get a specific todo   |
| PUT    | `/todos/:id` | Update a todo         |
| DELETE | `/todos/:id` | Delete a todo         |
| GET    | `/health`    | Health check          |
| GET    | `/metrics`   | Prometheus metrics    |
| GET    | `/api-docs`  | Swagger documentation |

## 🐳 Monitoring Stack (Docker)

- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3001 (admin/admin)

### Grafana Setup

1. Login to Grafana with `admin/admin`
2. Add Prometheus as a data source:
   - **Name**: Prometheus
   - **URL**: `http://prometheus:9090`
   - **Access**: Server (default)
   - Click "Save & Test" to verify the connection
3. Import dashboards or create your own

### SMTP Configuration (Email Notifications)

To enable email notifications in Grafana:

1. **Copy the environment template:**

   ```bash
   cp env.example .env
   ```

2. **Edit `.env` file** with your email credentials:

   ```env
   GRAFANA_SMTP_HOST=smtp.gmail.com
   GRAFANA_SMTP_PORT=587
   GRAFANA_SMTP_USER=your-email@gmail.com
   GRAFANA_SMTP_PASSWORD=your-app-password
   GRAFANA_SMTP_FROM_ADDRESS=your-email@gmail.com
   GRAFANA_SMTP_FROM_NAME=Todo App Grafana
   GRAFANA_ALERT_EMAIL_TO=admin@example.com
   ```

3. **Restart Grafana:**

   ```bash
   docker-compose restart grafana
   ```

4. **Test SMTP in Grafana:**
   - Go to **Configuration** → **Notification channels**
   - Click **Add channel**
   - Select **Email** and configure
   - Test the connection

**Note:** For Gmail, you need to:

- Enable 2-factor authentication
- Generate an "App Password" (not your regular password)
- Use the app password in `GRAFANA_SMTP_PASSWORD`

See `grafana-smtp-config.md` for detailed configuration options for different email providers.

### Troubleshooting

If you get connection errors in Grafana:

- Make sure your Node.js app is running locally on port 3000
- Verify Prometheus can reach your app by visiting http://localhost:9090/targets
- Check that the Prometheus target shows as "UP" for the todo-app job
- For SMTP issues, check the Grafana logs: `docker-compose logs grafana`

## 📊 Monitoring & Metrics

The application includes comprehensive Prometheus metrics for monitoring:

### Available Metrics

#### HTTP Metrics

- `http_request_duration_seconds` - Request duration histogram
- `http_requests_total` - Total request counter

#### Todo Metrics

- `active_todos` - Number of active (non-completed) todos
- `total_todos` - Total number of todos

#### System Metrics

- Default Node.js metrics (CPU, memory, event loop, etc.)

### Accessing Metrics

- http://localhost:3000/metrics

### Example Metrics Output

```
# HELP http_requests_total Total number of HTTP requests
# TYPE http_requests_total counter
http_requests_total{method="GET",route="/todos",status_code="200"} 15

# HELP active_todos Number of active (non-completed) todos
# TYPE active_todos gauge
active_todos 5

# HELP total_todos Total number of todos
# TYPE total_todos gauge
total_todos 10
```

## 📦 Dependencies

- **express** - Web framework
- **body-parser** - Request body parsing
- **cors** - Cross-origin resource sharing
- **morgan** - HTTP request logging
- **swagger-ui-express** - Swagger UI
- **swagger-jsdoc** - Swagger documentation generation
- **prom-client** - Prometheus metrics client
- **nodemon** - Development server with auto-restart

## 🤝 Contributing

1. Follow the existing folder structure
2. Add proper error handling
3. Include Swagger documentation for new endpoints
4. Update this README if needed

## 📄 License

ISC

## API Load Test Scripts

To generate traffic for your Todo API (useful for Prometheus/Grafana monitoring), you can use the provided scripts:

### 1. Node.js Script

- **File:** `test-apis.js`
- **Usage:**
  ```sh
  npm install axios
  node test-apis.js
  ```
- This script will call various endpoints (GET, POST, PUT, DELETE) multiple times and print a summary.

### 2. Bash Script (Linux/macOS/Git Bash)

- **File:** `test-apis.sh`
- **Usage:**
  ```sh
  ./test-apis.sh
  ```
- Requires `curl`, `jq` (optional, for pretty output), and `bc` (optional, for success rate calculation).
- You may need to run `chmod +x test-apis.sh` once to make it executable.

### 3. Windows Batch Script

- **File:** `test-apis.bat`
- **Usage:**
  ```bat
  test-apis.bat
  ```
- Requires `curl` in your PATH (install from https://curl.se/windows/ if needed).

---

These scripts will help you generate API traffic and see real-time metrics in Prometheus and Grafana dashboards.
