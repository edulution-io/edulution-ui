# Daily Plan Cache - Runbook

This document provides operational guidance for the Daily Plan caching system, which uses Redis for fast access and MongoDB for persistent storage.

## Architecture Overview

```
Request → Fetch Summary + Candidates → Compute Input Hash
    ↓
  Redis Hit? → Return with source='redis'
    ↓ no
  MongoDB Hit? → Populate Redis → Return with source='mongo'
    ↓ no
  Generate Plan → Persist to MongoDB → Cache in Redis → Return with source='generated'
```

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `MONGO_URI` | Yes | - | MongoDB connection string |
| `MONGO_DB_NAME` | No | edulution | Database name |
| `PERSIST_PLAN_INPUTS` | No | false | Store full input snapshots for debugging |
| `PLAN_CACHE_TTL_HOURS` | No | 168 | Redis cache TTL (default: 7 days) |
| `PLAN_RETENTION_DAYS` | No | 90 | MongoDB document TTL |
| `STRUCTURED_LOGGING` | No | false | Enable JSON structured logging |

## Setup

### 1. MongoDB Setup

```bash
# Ensure MongoDB is running
mongosh --eval "db.adminCommand('ping')"

# Indexes are created automatically on startup via Mongoose schema
# Verify indexes with:
mongosh edulution --eval "db.daily_plans.getIndexes()"
```

Expected indexes:
- `plan_id_1` (unique)
- `user_id_1_date_1_input_hash_1` (unique - unique_plan_version)
- `user_id_1_date_1_createdAt_-1` (user_date_latest)
- `createdAt_1` (TTL index for auto-deletion)

### 2. Redis Setup

```bash
# Verify Redis connection
redis-cli PING

# Check for existing plan keys
redis-cli KEYS "plan:*"
```

### 3. Environment Configuration

```bash
# Add to apps/api/.env
MONGO_URI=mongodb://localhost:27017
MONGO_DB_NAME=edulution
PERSIST_PLAN_INPUTS=true
PLAN_CACHE_TTL_HOURS=168
STRUCTURED_LOGGING=true
```

### 4. Start API

```bash
npm run api

# Look for log messages:
# - "PlanCacheService initialized"
# - "MongoDB connected"
```

## Verification

### Check Cache Flow

```bash
# Generate plan (first call)
curl -X POST "http://localhost:3001/edu-api/ai/daily-plan/test-user/2025-12-21" \
  -H "x-events-api-key: dev-events-key"

# Expected response:
# { "cached": false, "source": "generated", "input_hash": "...", ... }

# Second call (should hit Redis)
curl -X POST "http://localhost:3001/edu-api/ai/daily-plan/test-user/2025-12-21" \
  -H "x-events-api-key: dev-events-key"

# Expected response:
# { "cached": true, "source": "redis", "input_hash": "...", ... }
```

### Check Redis Cache

```bash
# List all plan keys
redis-cli KEYS "plan:*"

# Check meta for specific user/date
redis-cli HGETALL "plan:meta:test-user:2025-12-21"

# Check payload exists
redis-cli EXISTS "plan:payload:test-user:2025-12-21:abc12345"

# Check cache hit count
redis-cli HGET "plan:meta:test-user:2025-12-21" cache_hits
```

### Check MongoDB

```bash
# Find plan for user
mongosh edulution --eval "db.daily_plans.find({user_id: 'test-user'}).pretty()"

# Count all plans
mongosh edulution --eval "db.daily_plans.countDocuments()"

# Check specific fields
mongosh edulution --eval "db.daily_plans.findOne({user_id: 'test-user'}, {plan_id: 1, input_hash: 1, cache_hits: 1})"
```

## Troubleshooting

### Cache Not Working

1. **Check Redis connection**
   ```bash
   redis-cli PING
   ```

2. **Check MongoDB connection**
   ```bash
   mongosh --eval "db.adminCommand('ping')"
   ```

3. **Check service logs for errors**
   ```bash
   # Look for:
   # - "Failed to initialize PlanCacheService Redis connection"
   # - "MongoDB persist failed"
   # - "Redis cache check failed"
   ```

4. **Verify indexes exist**
   ```bash
   mongosh edulution --eval "db.daily_plans.getIndexes()"
   ```

### Input Hash Always Different

1. **Check for timestamp fields in hash computation**
   - The hash should NOT include generated_at or similar timestamps
   - Only activity_level, bucketed event counts, and candidate fingerprints

2. **Verify bucketing is working**
   - Event counts are bucketed: 0, 1-5, 6-10, 11-20, 20+
   - Scores are rounded to 0.1
   - Meeting times are rounded to the hour

3. **Check for non-deterministic fields**
   - Ensure random values aren't being included

### MongoDB Not Persisting

1. **Check MONGO_URI is correct**
   ```bash
   echo $MONGO_URI
   ```

2. **Check write permissions**
   ```bash
   mongosh edulution --eval "db.daily_plans.insertOne({test: true})"
   mongosh edulution --eval "db.daily_plans.deleteOne({test: true})"
   ```

3. **Look for duplicate key errors**
   - Check logs for "E11000 duplicate key error"
   - This indicates a race condition (which is handled gracefully)

### Plans Not Expiring

1. **Check TTL index exists**
   ```bash
   mongosh edulution --eval "db.daily_plans.getIndexes().filter(i => i.expireAfterSeconds)"
   ```

2. **Verify TTL is set correctly**
   ```bash
   # TTL is set in seconds: 90 days = 7776000 seconds
   mongosh edulution --eval "db.daily_plans.getIndexes().find(i => i.name === 'createdAt_1')"
   ```

## Maintenance

### Clear Cache for a User

```bash
# Clear Redis
redis-cli KEYS "plan:*:test-user:*" | xargs redis-cli DEL

# Clear MongoDB
mongosh edulution --eval "db.daily_plans.deleteMany({user_id: 'test-user'})"
```

### Clear Cache for a Specific Date

```bash
# Clear Redis
redis-cli DEL "plan:meta:test-user:2025-12-21"
redis-cli KEYS "plan:payload:test-user:2025-12-21:*" | xargs redis-cli DEL

# Clear MongoDB
mongosh edulution --eval "db.daily_plans.deleteMany({user_id: 'test-user', date: '2025-12-21'})"
```

### Force Regeneration

```bash
# Use refresh=true parameter
curl -X POST "http://localhost:3001/edu-api/ai/daily-plan/test-user/2025-12-21?refresh=true" \
  -H "x-events-api-key: dev-events-key"
```

### View Cache Statistics

```bash
# Redis hit counts
redis-cli HGET "plan:meta:test-user:2025-12-21" cache_hits

# MongoDB document count
mongosh edulution --eval "db.daily_plans.countDocuments()"

# Documents per user
mongosh edulution --eval "db.daily_plans.aggregate([{\$group: {_id: '\$user_id', count: {\$sum: 1}}}])"

# Average cache hits per document
mongosh edulution --eval "db.daily_plans.aggregate([{\$group: {_id: null, avg_hits: {\$avg: '\$cache_hits'}}}])"

# Most frequently accessed plans
mongosh edulution --eval "db.daily_plans.find().sort({cache_hits: -1}).limit(10).pretty()"
```

## Log Events to Monitor

| Log Event | Description | Action |
|-----------|-------------|--------|
| `[plan.cache_hit_redis]` | Plan served from Redis | Normal operation |
| `[plan.cache_hit_mongo]` | Plan served from MongoDB | Redis might be cold or evicted |
| `[plan.generated_new]` | New plan generated | First request or inputs changed |
| `MongoDB persist failed` | Failed to save to MongoDB | Check MongoDB connection |
| `Redis cache check failed` | Failed to read from Redis | Check Redis connection |
| `Failed to set Redis cache` | Failed to write to Redis | Check Redis memory/connection |

## Performance Expectations

| Scenario | Expected Latency |
|----------|------------------|
| Redis cache hit | < 50ms |
| MongoDB cache hit | < 200ms |
| New generation (with LLM) | 2-10 seconds |
| New generation (fallback) | < 100ms |

## Redis Key Schema

```
plan:meta:{userId}:{date}
  - input_hash: string (current cached hash)
  - plan_id: string (MongoDB document ID)
  - cached_at: ISO timestamp
  - cache_hits: number

plan:payload:{userId}:{date}:{inputHash}
  - JSON serialized AiDailyPlan
```

## MongoDB Document Schema

```javascript
{
  plan_id: "uuid",           // Unique plan identifier
  user_id: "string",         // User ID
  date: "YYYY-MM-DD",        // Plan date
  input_hash: "string",      // SHA256 hash of inputs (16 chars)
  generated_at: Date,        // When plan was generated
  plan: { ... },             // The actual daily plan
  cache_hits: Number,        // How many times served from cache
  used_fallback: Boolean,    // Whether deterministic fallback was used
  safety: {                  // Safety check results
    passed: Boolean,
    violations: [],
    repaired: Boolean
  },
  generation_meta: {         // Generation metadata
    service_version: "x.y.z",
    git_sha: "...",
    node_env: "production"
  },
  inputs_snapshot: { ... },  // Optional: stored inputs for debugging
  createdAt: Date,           // Auto-set by Mongoose
  updatedAt: Date            // Auto-set by Mongoose
}
```
