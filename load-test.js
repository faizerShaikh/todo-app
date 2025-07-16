const axios = require("axios");

// Configuration
const API_BASE_URL =
  "http://todo-app-lb-1823388198.us-east-1.elb.amazonaws.com";
const CONCURRENT_USERS = process.env.CONCURRENT_USERS || 10;
const TEST_DURATION_SECONDS = process.env.TEST_DURATION || 60;
const REQUEST_DELAY_MS = process.env.REQUEST_DELAY || 1000;

// Test statistics
let stats = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  startTime: null,
  endTime: null,
  responseTimes: [],
  statusCodes: {},
  errors: {},
};

// Test scenarios
const testScenarios = [
  { name: "GET /todos", method: "GET", url: "/todos" },
  { name: "GET /health", method: "GET", url: "/health" },
  {
    name: "POST /todos",
    method: "POST",
    url: "/todos",
    data: { title: "Load Test Todo" },
  },
  { name: "GET /todos/:id", method: "GET", url: "/todos/1" },
  {
    name: "PUT /todos/:id",
    method: "PUT",
    url: "/todos/1",
    data: { completed: true },
  },
];

async function makeRequest(scenario, userId) {
  const startTime = Date.now();
  stats.totalRequests++;

  try {
    const config = {
      method: scenario.method,
      url: `${API_BASE_URL}${scenario.url}`,
      timeout: 10000,
      headers: {
        "User-Agent": `LoadTest-User-${userId}`,
        "Content-Type": "application/json",
      },
    };

    if (scenario.data) {
      config.data = scenario.data;
    }

    const response = await axios(config);
    const responseTime = Date.now() - startTime;

    // Update statistics
    stats.successfulRequests++;
    stats.responseTimes.push(responseTime);

    const statusCode = response.status;
    stats.statusCodes[statusCode] = (stats.statusCodes[statusCode] || 0) + 1;

    console.log(
      `[User-${userId}] ✅ ${scenario.name} | Status: ${statusCode} | Time: ${responseTime}ms`
    );

    return { success: true, responseTime, statusCode };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    stats.failedRequests++;
    stats.responseTimes.push(responseTime);

    let statusCode = "ERROR";
    let errorMessage = error.message;

    if (error.response) {
      statusCode = error.response.status;
      errorMessage = `${error.response.status}: ${error.response.statusText}`;
    } else if (error.code === "ECONNABORTED") {
      errorMessage = "Request timeout";
    }

    stats.statusCodes[statusCode] = (stats.statusCodes[statusCode] || 0) + 1;
    stats.errors[errorMessage] = (stats.errors[errorMessage] || 0) + 1;

    console.error(
      `[User-${userId}] ❌ ${scenario.name} | Error: ${errorMessage} | Time: ${responseTime}ms`
    );

    return { success: false, responseTime, statusCode, error: errorMessage };
  }
}

async function simulateUser(userId) {
  console.log(`👤 User ${userId} started`);

  while (Date.now() < stats.endTime) {
    // Randomly select a test scenario
    const scenario =
      testScenarios[Math.floor(Math.random() * testScenarios.length)];

    await makeRequest(scenario, userId);

    // Add delay between requests
    await new Promise((resolve) => setTimeout(resolve, REQUEST_DELAY_MS));
  }

  console.log(`👤 User ${userId} finished`);
}

function calculateStats() {
  const totalTime = (stats.endTime - stats.startTime) / 1000;
  const avgResponseTime =
    stats.responseTimes.length > 0
      ? Math.round(
          stats.responseTimes.reduce((a, b) => a + b, 0) /
            stats.responseTimes.length
        )
      : 0;

  const sortedResponseTimes = [...stats.responseTimes].sort((a, b) => a - b);
  const p50 =
    sortedResponseTimes[Math.floor(sortedResponseTimes.length * 0.5)] || 0;
  const p95 =
    sortedResponseTimes[Math.floor(sortedResponseTimes.length * 0.95)] || 0;
  const p99 =
    sortedResponseTimes[Math.floor(sortedResponseTimes.length * 0.99)] || 0;

  const requestsPerSecond = Math.round(stats.totalRequests / totalTime);
  const successRate = (
    (stats.successfulRequests / stats.totalRequests) *
    100
  ).toFixed(2);

  return {
    totalTime,
    avgResponseTime,
    p50,
    p95,
    p99,
    requestsPerSecond,
    successRate,
  };
}

function printResults() {
  const results = calculateStats();

  console.log("\n" + "=".repeat(80));
  console.log("📊 LOAD TEST RESULTS");
  console.log("=".repeat(80));
  console.log(`⏱️  Test Duration: ${results.totalTime} seconds`);
  console.log(`👥 Concurrent Users: ${CONCURRENT_USERS}`);
  console.log(`📞 Total Requests: ${stats.totalRequests}`);
  console.log(
    `✅ Successful: ${stats.successfulRequests} (${results.successRate}%)`
  );
  console.log(`❌ Failed: ${stats.failedRequests}`);
  console.log(`🚀 Requests/Second: ${results.requestsPerSecond}`);
  console.log("");
  console.log("📈 Response Time Statistics:");
  console.log(`   Average: ${results.avgResponseTime}ms`);
  console.log(`   50th percentile: ${results.p50}ms`);
  console.log(`   95th percentile: ${results.p95}ms`);
  console.log(`   99th percentile: ${results.p99}ms`);
  console.log("");
  console.log("📊 Status Code Distribution:");
  Object.entries(stats.statusCodes).forEach(([code, count]) => {
    const percentage = ((count / stats.totalRequests) * 100).toFixed(1);
    console.log(`   ${code}: ${count} (${percentage}%)`);
  });

  if (Object.keys(stats.errors).length > 0) {
    console.log("");
    console.log("❌ Error Summary:");
    Object.entries(stats.errors).forEach(([error, count]) => {
      console.log(`   ${error}: ${count} times`);
    });
  }

  console.log("=".repeat(80));
}

async function runLoadTest() {
  console.log("🚀 Starting Load Test...");
  console.log(`📡 Target URL: ${API_BASE_URL}`);
  console.log(`👥 Concurrent Users: ${CONCURRENT_USERS}`);
  console.log(`⏱️  Duration: ${TEST_DURATION_SECONDS} seconds`);
  console.log(`⏰ Request Delay: ${REQUEST_DELAY_MS}ms`);
  console.log("─".repeat(80));

  stats.startTime = Date.now();
  stats.endTime = stats.startTime + TEST_DURATION_SECONDS * 1000;

  // Start concurrent users
  const userPromises = [];
  for (let i = 1; i <= CONCURRENT_USERS; i++) {
    userPromises.push(simulateUser(i));
  }

  // Wait for all users to complete
  await Promise.all(userPromises);

  // Print results
  printResults();
}

// Handle graceful shutdown
process.on("SIGINT", () => {
  console.log("\n🛑 Load test stopped by user");
  stats.endTime = Date.now();
  printResults();
  process.exit(0);
});

// Start the load test
runLoadTest().catch((error) => {
  console.error("Load test failed:", error);
  process.exit(1);
});
