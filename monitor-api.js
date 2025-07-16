const axios = require("axios");

const API_URL =
  "http://todo-app-lb-1823388198.us-east-1.elb.amazonaws.com/todos";
const INTERVAL_MS = 1; // 5 seconds between calls

async function callAPI() {
  try {
    const response = await axios.get(API_URL);
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] API Response - Count: ${response.data.count}`);
  } catch (error) {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] Error calling API:`, error.message);
  }
}

function startMonitoring() {
  console.log(`🚀 Starting API monitoring...`);
  console.log(`📡 Target URL: ${API_URL}`);
  console.log(`⏱️  Interval: ${INTERVAL_MS}ms`);
  console.log(`📊 Logging response.count`);
  console.log("─".repeat(60));

  // Initial call
  callAPI();

  // Set up continuous monitoring
  setInterval(callAPI, INTERVAL_MS);
}

// Handle graceful shutdown
process.on("SIGINT", () => {
  console.log("\n🛑 Monitoring stopped by user");
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\n🛑 Monitoring stopped");
  process.exit(0);
});

// Start the monitoring
startMonitoring();
