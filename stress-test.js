const axios = require("axios");

// Configuration
const API_URL =
  "http://todo-app-lb-1823388198.us-east-1.elb.amazonaws.com/todos";
const CONCURRENT_REQUESTS = process.env.CONCURRENT_REQUESTS || 50;
const TOTAL_REQUESTS = process.env.TOTAL_REQUESTS || 1000;
const TIMEOUT_MS = 5000;

// Statistics
let stats = {
  completed: 0,
  successful: 0,
  failed: 0,
  startTime: Date.now(),
  responseTimes: [],
  errors: {},
};

async function makeRequest(requestId) {
  const startTime = Date.now();

  try {
    const response = await axios.get(API_URL, {
      timeout: TIMEOUT_MS,
      headers: {
        "User-Agent": `StressTest-${requestId}`,
      },
    });

    const responseTime = Date.now() - startTime;
    stats.successful++;
    stats.responseTimes.push(responseTime);

    console.log(
      `✅ Request ${requestId} | Count: ${response.data.count} | Time: ${responseTime}ms`
    );
  } catch (error) {
    const responseTime = Date.now() - startTime;
    stats.failed++;
    stats.responseTimes.push(responseTime);

    let errorMsg = error.message;
    if (error.code === "ECONNABORTED") {
      errorMsg = "Timeout";
    } else if (error.response) {
      errorMsg = `HTTP ${error.response.status}`;
    }

    stats.errors[errorMsg] = (stats.errors[errorMsg] || 0) + 1;
    console.error(
      `❌ Request ${requestId} | Error: ${errorMsg} | Time: ${responseTime}ms`
    );
  }

  stats.completed++;

  // Progress indicator
  if (stats.completed % 100 === 0) {
    const progress = ((stats.completed / TOTAL_REQUESTS) * 100).toFixed(1);
    const elapsed = (Date.now() - stats.startTime) / 1000;
    const rate = Math.round(stats.completed / elapsed);
    console.log(
      `📊 Progress: ${progress}% (${stats.completed}/${TOTAL_REQUESTS}) | Rate: ${rate} req/s`
    );
  }
}

async function runStressTest() {
  console.log("🔥 Starting Stress Test...");
  console.log(`📡 Target: ${API_URL}`);
  console.log(`👥 Concurrent Requests: ${CONCURRENT_REQUESTS}`);
  console.log(`📞 Total Requests: ${TOTAL_REQUESTS}`);
  console.log(`⏰ Timeout: ${TIMEOUT_MS}ms`);
  console.log("─".repeat(60));

  const startTime = Date.now();

  // Create batches of concurrent requests
  for (let i = 0; i < TOTAL_REQUESTS; i += CONCURRENT_REQUESTS) {
    const batch = [];
    const batchSize = Math.min(CONCURRENT_REQUESTS, TOTAL_REQUESTS - i);

    for (let j = 0; j < batchSize; j++) {
      const requestId = i + j + 1;
      batch.push(makeRequest(requestId));
    }

    await Promise.all(batch);
  }

  const totalTime = (Date.now() - startTime) / 1000;
  const avgResponseTime = Math.round(
    stats.responseTimes.reduce((a, b) => a + b, 0) / stats.responseTimes.length
  );
  const successRate = ((stats.successful / stats.completed) * 100).toFixed(2);
  const requestsPerSecond = Math.round(stats.completed / totalTime);

  // Sort response times for percentiles
  const sortedTimes = [...stats.responseTimes].sort((a, b) => a - b);
  const p50 = sortedTimes[Math.floor(sortedTimes.length * 0.5)];
  const p95 = sortedTimes[Math.floor(sortedTimes.length * 0.95)];
  const p99 = sortedTimes[Math.floor(sortedTimes.length * 0.99)];

  console.log("\n" + "=".repeat(60));
  console.log("🔥 STRESS TEST RESULTS");
  console.log("=".repeat(60));
  console.log(`⏱️  Total Time: ${totalTime.toFixed(2)}s`);
  console.log(`📞 Total Requests: ${stats.completed}`);
  console.log(`✅ Successful: ${stats.successful} (${successRate}%)`);
  console.log(`❌ Failed: ${stats.failed}`);
  console.log(`🚀 Requests/Second: ${requestsPerSecond}`);
  console.log("");
  console.log("📈 Response Times:");
  console.log(`   Average: ${avgResponseTime}ms`);
  console.log(`   50th percentile: ${p50}ms`);
  console.log(`   95th percentile: ${p95}ms`);
  console.log(`   99th percentile: ${p99}ms`);

  if (Object.keys(stats.errors).length > 0) {
    console.log("");
    console.log("❌ Errors:");
    Object.entries(stats.errors).forEach(([error, count]) => {
      console.log(`   ${error}: ${count} times`);
    });
  }

  console.log("=".repeat(60));
}

// Handle graceful shutdown
process.on("SIGINT", () => {
  console.log("\n🛑 Stress test stopped by user");
  process.exit(0);
});

// Start the stress test
runStressTest().catch((error) => {
  console.error("Stress test failed:", error);
  process.exit(1);
});
