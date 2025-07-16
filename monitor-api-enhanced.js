const axios = require("axios");

// Configuration
const API_URL =
  "http://todo-app-lb-1823388198.us-east-1.elb.amazonaws.com/todos";
const INTERVAL_MS = process.env.MONITOR_INTERVAL || 5000; // Configurable interval
const TIMEOUT_MS = 10000; // 10 second timeout

// Statistics tracking
let stats = {
  totalCalls: 0,
  successfulCalls: 0,
  failedCalls: 0,
  startTime: new Date(),
  lastCount: null,
  minCount: Infinity,
  maxCount: 0,
  averageCount: 0,
  totalCount: 0,
};

async function callAPI() {
  const startTime = Date.now();
  stats.totalCalls++;

  try {
    const response = await axios.get(API_URL, {
      timeout: TIMEOUT_MS,
      headers: {
        "User-Agent": "TodoApp-Monitor/1.0",
      },
    });

    const responseTime = Date.now() - startTime;
    const count = response.data.count;
    const timestamp = new Date().toISOString();

    // Update statistics
    stats.successfulCalls++;
    stats.lastCount = count;
    stats.totalCount += count;
    stats.averageCount = Math.round(stats.totalCount / stats.successfulCalls);

    if (count < stats.minCount) stats.minCount = count;
    if (count > stats.maxCount) stats.maxCount = count;

    console.log(
      `[${timestamp}] ✅ Count: ${count} | Response Time: ${responseTime}ms | Avg: ${stats.averageCount} | Min: ${stats.minCount} | Max: ${stats.maxCount}`
    );
  } catch (error) {
    stats.failedCalls++;
    const responseTime = Date.now() - startTime;
    const timestamp = new Date().toISOString();

    let errorMessage = error.message;
    if (error.code === "ECONNABORTED") {
      errorMessage = "Request timeout";
    } else if (error.response) {
      errorMessage = `HTTP ${error.response.status}: ${error.response.statusText}`;
    }

    console.error(
      `[${timestamp}] ❌ Error: ${errorMessage} | Response Time: ${responseTime}ms`
    );
  }
}

function printStats() {
  const uptime = Date.now() - stats.startTime.getTime();
  const uptimeMinutes = Math.round(uptime / 60000);
  const successRate =
    stats.totalCalls > 0
      ? ((stats.successfulCalls / stats.totalCalls) * 100).toFixed(1)
      : 0;

  console.log("\n" + "=".repeat(60));
  console.log("📊 MONITORING STATISTICS");
  console.log("=".repeat(60));
  console.log(`⏱️  Uptime: ${uptimeMinutes} minutes`);
  console.log(`📞 Total Calls: ${stats.totalCalls}`);
  console.log(`✅ Successful: ${stats.successfulCalls} (${successRate}%)`);
  console.log(`❌ Failed: ${stats.failedCalls}`);
  console.log(`📊 Current Count: ${stats.lastCount || "N/A"}`);
  console.log(`📈 Average Count: ${stats.averageCount}`);
  console.log(
    `📉 Min Count: ${stats.minCount === Infinity ? "N/A" : stats.minCount}`
  );
  console.log(`📈 Max Count: ${stats.maxCount}`);
  console.log("=".repeat(60) + "\n");
}

function startMonitoring() {
  console.log(`🚀 Starting Enhanced API Monitoring...`);
  console.log(`📡 Target URL: ${API_URL}`);
  console.log(`⏱️  Interval: ${INTERVAL_MS}ms`);
  console.log(`⏰ Timeout: ${TIMEOUT_MS}ms`);
  console.log(`📊 Logging response.count with statistics`);
  console.log("─".repeat(60));

  // Initial call
  callAPI();

  // Set up continuous monitoring
  const intervalId = setInterval(callAPI, INTERVAL_MS);

  // Print stats every 5 minutes
  const statsIntervalId = setInterval(printStats, 5 * 60 * 1000);

  // Handle graceful shutdown
  process.on("SIGINT", () => {
    console.log("\n🛑 Monitoring stopped by user");
    clearInterval(intervalId);
    clearInterval(statsIntervalId);
    printStats();
    process.exit(0);
  });

  process.on("SIGTERM", () => {
    console.log("\n🛑 Monitoring stopped");
    clearInterval(intervalId);
    clearInterval(statsIntervalId);
    printStats();
    process.exit(0);
  });
}

// Start the monitoring
startMonitoring();
