# Coptic.IO API Benchmarks - 2026-01-31 (v3 - Seasons Optimized)

## Summary

| Endpoint | Req/sec | Latency (avg) | vs v2 |
|----------|--------:|--------------:|------:|
| Health | 60,304 | 0.01 ms | +59% |
| Celebrations | 39,657 | 0.01 ms | **+72%** |
| Fasting | 48,835 | 0.01 ms | **+69%** |
| Readings | 53,737 | 0.01 ms | +12% |
| Synaxarium Search | 50,153 | 0.01 ms | +35% |
| Calendar Month | 8,696 | 0.62 ms | +29% |
| GraphQL | 25,966 | 0.01 ms | +51% |

## Optimizations Applied
- Removed date-fns from @coptic/core runtime dependencies
- Pre-compute season timestamps at cache time (not per-lookup)
- Use integer timestamp comparisons instead of Date objects
- Shared date utilities in `/packages/core/src/utils/date.ts`

## Configuration
- Duration: 5s per endpoint
- Connections: 10 concurrent
- Node: v22.14.0

## Detailed Results

### Health
```
│ Latency │ 0 ms │ 0 ms │ 0 ms  │ 0 ms │ 0.01 ms │ 0.06 ms │ 5 ms │
│ Req/Sec   │ 57,823  │ 57,823  │ 59,071  │ 63,135  │ 60,304  │ 2,108.61 │ 57,818  │
302k requests in 5.01s, 58.8 MB read
```

### Celebrations
```
│ Latency │ 0 ms │ 0 ms │ 0 ms  │ 0 ms │ 0.01 ms │ 0.08 ms │ 5 ms │
│ Req/Sec   │ 36,863  │ 36,863  │ 40,031  │ 40,767  │ 39,657.6 │ 1,448.22 │ 36,849  │
198k requests in 5.01s, 41 MB read
```

### Fasting
```
│ Latency │ 0 ms │ 0 ms │ 0 ms  │ 0 ms │ 0.01 ms │ 0.04 ms │ 4 ms │
│ Req/Sec   │ 48,351  │ 48,351  │ 48,703  │ 49,407  │ 48,835.2 │ 370.21 │ 48,344  │
244k requests in 5.01s, 47.4 MB read
```

### Readings
```
│ Latency │ 0 ms │ 0 ms │ 0 ms  │ 0 ms │ 0.01 ms │ 0.04 ms │ 5 ms │
│ Req/Sec   │ 53,183  │ 53,183  │ 53,855  │ 54,047  │ 53,737.6 │ 299.78 │ 53,167  │
269k requests in 5.01s, 212 MB read
```

### Synaxarium Search
```
│ Latency │ 0 ms │ 0 ms │ 0 ms  │ 0 ms │ 0.01 ms │ 0.04 ms │ 4 ms │
│ Req/Sec   │ 49,279  │ 49,279  │ 50,335  │ 50,655  │ 50,153.6 │ 503.7  │ 49,257  │
251k requests in 5.01s, 49.2 MB read
```

### Calendar Month
```
│ Latency │ 0 ms │ 1 ms │ 2 ms  │ 2 ms │ 0.62 ms │ 0.59 ms │ 5 ms │
│ Req/Sec   │ 8,615   │ 8,615   │ 8,719   │ 8,743   │ 8,696.8 │ 44.29  │ 8,612   │
43k requests in 5.01s, 294 MB read
```

### GraphQL
```
│ Latency │ 0 ms │ 0 ms │ 0 ms  │ 0 ms │ 0.01 ms │ 0.15 ms │ 13 ms │
│ Req/Sec   │ 25,247  │ 25,247  │ 26,303  │ 26,431  │ 25,966.4 │ 502.68 │ 25,233  │
130k requests in 5.01s, 46.3 MB read
```

## Resource Usage
- Memory (RSS): 293.5 MB
