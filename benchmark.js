const axios = require("axios");

const API_URL =
  "http://todo-app-lb-1823388198.us-east-1.elb.amazonaws.com/todos";

// Benchmark configurations
const benchmarks = [
  { name: "Single Request", requests: 1, concurrent: 1 },
  { name: "10 Sequential", requests: 10, concurrent: 1 },
  { name: "10 Concurrent", requests: 10, concurrent: 10 },
  { name: "50 Concurrent", requests: 50, concurrent: 50 },
  { name: "100 Concurrent", requests: 100, concurrent: 100 },
];

async function runBenchmark(benchmark) {
  console.log(`\n🔬 Running: ${benchmark.name}`);
  console.log(
    `📞 Requests: ${benchmark.requests} | Concurrent: ${benchmark.concurrent}`
  );

  const startTime = Date.now();
  const responseTimes = [];
  const errors = [];

  // Create requests
  const requests = [];
  for (let i = 0; i < benchmark.requests; i++) {
    requests.push(makeRequest(i + 1));
  }

  // Execute requests based on concurrency
  if (benchmark.concurrent === 1) {
    // Sequential execution
    for (const request of requests) {
      const result = await request;
      if (result.success) {
        responseTimes.push(result.responseTime);
      } else {
        errors.push(result.error);
      }
    }
  } else {
    // Concurrent execution in batches
    for (let i = 0; i < requests.length; i += benchmark.concurrent) {
      const batch = requests.slice(i, i + benchmark.concurrent);
      const results = await Promise.all(batch);

      results.forEach((result) => {
        if (result.success) {
          responseTimes.push(result.responseTime);
        } else {
          errors.push(result.error);
        }
      });
    }
  }

  const totalTime = Date.now() - startTime;
  const successCount = responseTimes.length;
  const errorCount = errors.length;

  // Calculate statistics
  const avgTime =
    responseTimes.length > 0
      ? Math.round(
          responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
        )
      : 0;

  const sortedTimes = [...responseTimes].sort((a, b) => a - b);
  const minTime = sortedTimes[0] || 0;
  const maxTime = sortedTimes[sortedTimes.length - 1] || 0;
  const medianTime = sortedTimes[Math.floor(sortedTimes.length / 2)] || 0;

  const requestsPerSecond = Math.round((successCount / totalTime) * 1000);
  const successRate = ((successCount / benchmark.requests) * 100).toFixed(1);

  console.log(`⏱️  Total Time: ${totalTime}ms`);
  console.log(
    `✅ Success: ${successCount}/${benchmark.requests} (${successRate}%)`
  );
  console.log(`❌ Errors: ${errorCount}`);
  console.log(`🚀 Requests/sec: ${requestsPerSecond}`);
  console.log(`📊 Response Times:`);
  console.log(`   Average: ${avgTime}ms`);
  console.log(`   Median: ${medianTime}ms`);
  console.log(`   Min: ${minTime}ms`);
  console.log(`   Max: ${maxTime}ms`);

  if (errors.length > 0) {
    const errorSummary = {};
    errors.forEach((error) => {
      errorSummary[error] = (errorSummary[error] || 0) + 1;
    });
    console.log(`❌ Error Summary:`);
    Object.entries(errorSummary).forEach(([error, count]) => {
      console.log(`   ${error}: ${count} times`);
    });
  }

  return {
    name: benchmark.name,
    totalTime,
    successCount,
    errorCount,
    avgTime,
    requestsPerSecond,
    successRate,
  };
}

async function makeRequest(requestId) {
  const startTime = Date.now();

  try {
    const response = await axios.get(API_URL, {
      timeout: 10000,
      headers: {
        "User-Agent": `Benchmark-${requestId}`,
      },
    });

    const responseTime = Date.now() - startTime;
    console.log(
      `  ✅ Request ${requestId}: ${responseTime}ms (Count: ${response.data.count})`
    );

    return { success: true, responseTime };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    let errorMsg = error.message;

    if (error.code === "ECONNABORTED") {
      errorMsg = "Timeout";
    } else if (error.response) {
      errorMsg = `HTTP ${error.response.status}`;
    }

    console.log(`  ❌ Request ${requestId}: ${errorMsg} (${responseTime}ms)`);
    return { success: false, error: errorMsg, responseTime };
  }
}

async function runAllBenchmarks() {
  console.log("🚀 Starting API Benchmark Tests...");
  console.log(`📡 Target: ${API_URL}`);
  console.log("─".repeat(60));

  const results = [];

  for (const benchmark of benchmarks) {
    const result = await runBenchmark(benchmark);
    results.push(result);
  }

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("📊 BENCHMARK SUMMARY");
  console.log("=".repeat(60));

  results.forEach((result) => {
    console.log(
      `${result.name.padEnd(15)} | ${result.successCount
        .toString()
        .padStart(3)}/${result.totalTime
        .toString()
        .padStart(4)}ms | ${result.requestsPerSecond
        .toString()
        .padStart(3)} req/s | ${result.successRate}% success`
    );
  });

  console.log("=".repeat(60));
}

// Handle graceful shutdown
process.on("SIGINT", () => {
  console.log("\n🛑 Benchmark stopped by user");
  process.exit(0);
});

// Start benchmarks
runAllBenchmarks().catch((error) => {
  console.error("Benchmark failed:", error);
  process.exit(1);
});
