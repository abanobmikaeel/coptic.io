#!/bin/bash

# Configuration
BASE_URL="${BASE_URL:-http://localhost:3000}"
DURATION="${DURATION:-10}"
CONNECTIONS="${CONNECTIONS:-10}"
OUTPUT_FILE="${OUTPUT_FILE:-}"

AUTOCANNON="$(dirname "$0")/../node_modules/.bin/autocannon"

# Check if server is running
if ! curl -s "$BASE_URL/health" > /dev/null 2>&1; then
  echo "❌ Server not responding at $BASE_URL"
  echo "   Start it with: pnpm --filter @coptic/api dev"
  exit 1
fi

# Warmup
echo "Warming up..." >&2
curl -s "$BASE_URL/health" > /dev/null
curl -s "$BASE_URL/api/celebrations/2025-04-20" > /dev/null
sleep 1

echo "" >&2
echo "Running benchmarks (${DURATION}s per endpoint, ${CONNECTIONS} connections)..." >&2
echo "" >&2

# Start output
{
  echo "# Coptic.IO API Benchmarks - $(date +%Y-%m-%d)"
  echo ""
  echo "## Configuration"
  echo "- Duration: ${DURATION}s per endpoint"
  echo "- Connections: ${CONNECTIONS} concurrent"
  echo "- Node: $(node -v 2>/dev/null || echo 'unknown')"
  echo ""
  echo "## Results"
  echo ""
} > /tmp/bench_output.md

run_bench() {
  local name=$1
  local url=$2
  local method=${3:-GET}
  local body=${4:-}

  echo "  $name..." >&2

  {
    echo "### $name"
    echo '```'
    if [ -n "$body" ]; then
      $AUTOCANNON -c $CONNECTIONS -d $DURATION -m $method \
        -H "Content-Type: application/json" -b "$body" "$url" 2>&1 | \
        grep -E "Latency|Req/Sec|Bytes/Sec|requests in|errors"
    else
      $AUTOCANNON -c $CONNECTIONS -d $DURATION "$url" 2>&1 | \
        grep -E "Latency|Req/Sec|Bytes/Sec|requests in|errors"
    fi
    echo '```'
    echo ""
  } >> /tmp/bench_output.md
}

run_bench "Health" "$BASE_URL/health"
run_bench "Celebrations" "$BASE_URL/api/celebrations/2025-04-20"
run_bench "Fasting" "$BASE_URL/api/fasting/2025-02-24"
run_bench "Readings" "$BASE_URL/api/readings/2025-04-20"
run_bench "Synaxarium Search" "$BASE_URL/api/synaxarium/search?q=mary"
run_bench "Calendar Month" "$BASE_URL/api/calendar/month/2025/3"
run_bench "GraphQL" "$BASE_URL/graphql" "POST" '{"query":"{ celebrations(date: \"2025-04-20\") { name type } }"}'

# Memory
{
  echo "## Resource Usage"
  pid=$(lsof -ti :${BASE_URL##*:} 2>/dev/null | head -1)
  if [ -n "$pid" ]; then
    rss_kb=$(ps -o rss= -p "$pid" 2>/dev/null | tr -d ' ')
    if [ -n "$rss_kb" ]; then
      rss_mb=$(echo "scale=1; $rss_kb / 1024" | bc)
      echo "- Memory (RSS): ${rss_mb} MB"
    fi
  fi
  echo ""
} >> /tmp/bench_output.md

if [ -n "$OUTPUT_FILE" ]; then
  mv /tmp/bench_output.md "$OUTPUT_FILE"
  echo "" >&2
  echo "Results saved to $OUTPUT_FILE" >&2
else
  cat /tmp/bench_output.md
  rm /tmp/bench_output.md
fi

echo "✅ Benchmark complete!" >&2
