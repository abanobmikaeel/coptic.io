#!/bin/bash

echo "🔥 Coptic.IO API Performance Benchmarks"
echo "========================================"
echo ""

BASE_URL="http://localhost:3001"

# Test 1: Health Check
echo "📊 Test 1: Health Check (warmup)"
curl -s -o /dev/null -w "Time: %{time_total}s | Status: %{http_code}\n" $BASE_URL/health
echo ""

# Test 2: Simple endpoint - Health (100 requests)
echo "📊 Test 2: Health Endpoint - 100 concurrent requests"
echo "Running ab benchmark..."
ab -n 100 -c 10 -q $BASE_URL/health 2>&1 | grep -E "Requests per second|Time per request|Transfer rate"
echo ""

# Test 3: Celebrations endpoint
echo "📊 Test 3: Celebrations Endpoint - Single request latency"
curl -s -o /dev/null -w "Time: %{time_total}s | Status: %{http_code}\n" "$BASE_URL/api/celebrations/2025-04-20"
echo ""

# Test 4: Celebrations - 100 requests
echo "📊 Test 4: Celebrations Endpoint - 100 concurrent requests"
ab -n 100 -c 10 -q "$BASE_URL/api/celebrations/2025-04-20" 2>&1 | grep -E "Requests per second|Time per request|Transfer rate"
echo ""

# Test 5: Fasting endpoint
echo "📊 Test 5: Fasting Endpoint - Single request latency"
curl -s -o /dev/null -w "Time: %{time_total}s | Status: %{http_code}\n" "$BASE_URL/api/fasting/2025-02-24"
echo ""

# Test 6: Fasting - 100 requests
echo "📊 Test 6: Fasting Endpoint - 100 concurrent requests"
ab -n 100 -c 10 -q "$BASE_URL/api/fasting/2025-02-24" 2>&1 | grep -E "Requests per second|Time per request|Transfer rate"
echo ""

# Test 7: Readings endpoint (more complex)
echo "📊 Test 7: Readings Endpoint - Single request latency"
curl -s -o /dev/null -w "Time: %{time_total}s | Status: %{http_code}\n" "$BASE_URL/api/readings/2025-04-20"
echo ""

# Test 8: Readings - 50 requests (more complex endpoint)
echo "📊 Test 8: Readings Endpoint - 50 concurrent requests"
ab -n 50 -c 5 -q "$BASE_URL/api/readings/2025-04-20" 2>&1 | grep -E "Requests per second|Time per request|Transfer rate"
echo ""

# Test 9: GraphQL query
echo "📊 Test 9: GraphQL Endpoint - Single request latency"
curl -s -o /dev/null -w "Time: %{time_total}s | Status: %{http_code}\n" \
  -X POST "$BASE_URL/graphql" \
  -H "Content-Type: application/json" \
  -d '{"query":"{ celebrations(date: \"2025-04-20\") { name type } }"}'
echo ""

# Memory usage
echo "📊 Container Resource Usage:"
docker stats coptic-bench --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}"
echo ""

echo "✅ Benchmark complete!"
