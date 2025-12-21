# Event Logging & Recommendations System - Testing Guide

A complete guide for testing the Event Logging and Recommendations system locally.

## Table of Contents

1. [Prerequisites Check](#1-prerequisites-check)
2. [Test Data Setup](#2-test-data-setup)
3. [Event Pipeline Test](#3-event-pipeline-test)
4. [Recommendations Test](#4-recommendations-test)
5. [API Endpoints Test](#5-api-endpoints-test)
6. [Full Integration Test Script](#6-full-integration-test-script)
7. [Troubleshooting](#7-troubleshooting)

---

## 1. Prerequisites Check

### 1.1 Check Redis is Running

```bash
# Check if Redis container is running
docker ps | grep redis
```

**Expected output:**
```
abc123def456   redis:7.0   "docker-entrypoint.s…"   Up 2 hours   0.0.0.0:6379->6379/tcp   edulution-ui-redis-1
```

If not running, start it:
```bash
docker compose up -d redis
```

### 1.2 Verify Redis Connection

```bash
redis-cli ping
```

**Expected output:**
```
PONG
```

### 1.3 Check API is Running

```bash
curl -s http://localhost:3001/events/ready | jq
```

**Expected output:**
```json
{
  "ready": true,
  "timestamp": "2024-01-15T10:00:00.000Z"
}
```

If not running, start the API:
```bash
npm run api
```

### 1.4 Verify API Key Works

The Events API requires an API key header. In development mode, use `dev-events-key`:

```bash
curl -s http://localhost:3001/events/health \
  -H "X-Events-API-Key: dev-events-key" | jq
```

**Expected output:**
```json
{
  "status": "healthy",
  "redis": "connected",
  "streams": { ... },
  "consumers": { ... }
}
```

---

## 2. Test Data Setup

### 2.1 Load Demo Data

Load demo events for testing (mail, chat, calendar):

```bash
# Default: 3 users, 5 threads, 3 channels, 5 calendar events each
npx tsx apps/api/src/events/cli/load-demo-data.ts
```

**Expected output:**
```
Loading demo data...
  Threads per user: 5
  Channels per user: 3
  Calendar events per user: 5
Publishing events for demo-user-1...
Publishing events for demo-user-2...
Publishing events for demo-user-3...
Demo data loaded successfully!
  Total events: 39
  Users: 3
```

### 2.2 Load Demo Data with Custom Options

```bash
# More data for stress testing
npx tsx apps/api/src/events/cli/load-demo-data.ts \
  --threads 10 \
  --channels 5 \
  --calendar-events 10
```

### 2.3 Verify Demo Data in Redis

```bash
# Check stream lengths
redis-cli XLEN events:stream:mail
redis-cli XLEN events:stream:chat
redis-cli XLEN events:stream:caldav

# Check user state keys exist
redis-cli KEYS "state:user:demo-user-1:*"
```

**Expected output:**
```
(integer) 15
(integer) 9
(integer) 15

1) "state:user:demo-user-1:lastseen"
2) "state:user:demo-user-1:counts:1h"
3) "state:user:demo-user-1:counts:24h"
```

---

## 3. Event Pipeline Test

### 3.1 Ingest a Single Event

```bash
curl -s -X POST http://localhost:3001/events/ingest \
  -H "Content-Type: application/json" \
  -H "X-Events-API-Key: dev-events-key" \
  -d '{
    "event": {
      "user_id": "test-user-1",
      "source": "files",
      "type": "file.created",
      "object": {
        "object_type": "file",
        "object_id": "file-001",
        "object_ref": "/documents/test.pdf"
      },
      "metadata": {
        "file_size": 1024
      }
    }
  }' | jq
```

**Expected output:**
```json
{
  "success": true,
  "event_id": "550e8400-e29b-41d4-a716-446655440000",
  "stream_id": "1705312800000-0",
  "deduplicated": false
}
```

### 3.2 Test Deduplication with Idempotency Key

Use an `idempotency_key` to ensure safe retries:

```bash
# First request with idempotency_key
curl -s -X POST http://localhost:3001/events/ingest \
  -H "Content-Type: application/json" \
  -H "X-Events-API-Key: dev-events-key" \
  -d '{
    "idempotency_key": "test-dedup-001",
    "event": {
      "user_id": "test-user-1",
      "source": "files",
      "type": "file.created",
      "object": {
        "object_type": "file",
        "object_id": "file-001"
      }
    }
  }' | jq
```

**Expected output (first request):**
```json
{
  "success": true,
  "event_id": "550e8400-e29b-41d4-a716-446655440000",
  "stream_id": "1705312800000-0",
  "deduplicated": false
}
```

```bash
# Same request again (retry scenario)
curl -s -X POST http://localhost:3001/events/ingest \
  -H "Content-Type: application/json" \
  -H "X-Events-API-Key: dev-events-key" \
  -d '{
    "idempotency_key": "test-dedup-001",
    "event": {
      "user_id": "test-user-1",
      "source": "files",
      "type": "file.created",
      "object": {
        "object_type": "file",
        "object_id": "file-001"
      }
    }
  }' | jq
```

**Expected output (deduplicated, returns same event_id):**
```json
{
  "success": true,
  "event_id": "550e8400-e29b-41d4-a716-446655440000",
  "stream_id": null,
  "deduplicated": true
}
```

**Verify the idempotency key in Redis:**
```bash
redis-cli GET events:idem:test-dedup-001
# Returns: "550e8400-e29b-41d4-a716-446655440000"
```

### 3.3 Batch Ingest

```bash
curl -s -X POST http://localhost:3001/events/ingest/batch \
  -H "Content-Type: application/json" \
  -H "X-Events-API-Key: dev-events-key" \
  -d '{
    "events": [
      {
        "user_id": "test-user-1",
        "source": "files",
        "type": "file.created",
        "object": { "object_type": "file", "object_id": "file-002" }
      },
      {
        "user_id": "test-user-1",
        "source": "files",
        "type": "file.moved",
        "object": { "object_type": "file", "object_id": "file-003" }
      }
    ]
  }' | jq
```

**Expected output:**
```json
{
  "total": 2,
  "successful": 2,
  "deduplicated": 0,
  "failed": 0,
  "results": [...]
}
```

### 3.4 Check Health and Metrics

```bash
# System health
curl -s http://localhost:3001/events/health \
  -H "X-Events-API-Key: dev-events-key" | jq

# Metrics
curl -s http://localhost:3001/events/metrics \
  -H "X-Events-API-Key: dev-events-key" | jq

# DLQ stats
curl -s http://localhost:3001/events/dlq/stats \
  -H "X-Events-API-Key: dev-events-key" | jq
```

---

## 4. Recommendations Test

### 4.1 List Available Rules

```bash
curl -s http://localhost:3001/recommendations/rules \
  -H "X-Events-API-Key: dev-events-key" | jq
```

**Expected output:**
```json
{
  "count": 13,
  "rules": [
    {
      "id": "calendar:meeting-prep",
      "name": "Meeting Preparation",
      "class": "meeting",
      "priority": 90,
      "enabled": true
    },
    {
      "id": "communication:awaiting-reply",
      "name": "Awaiting Reply",
      "class": "communication",
      "priority": 80,
      "enabled": true
    },
    ...
  ]
}
```

### 4.2 Generate Recommendations

```bash
curl -s -X POST http://localhost:3001/recommendations/demo-user-1/generate \
  -H "X-Events-API-Key: dev-events-key" | jq
```

**Expected output:**
```json
{
  "user_id": "demo-user-1",
  "candidates_generated": 3,
  "rules_evaluated": 13,
  "duration_ms": 45
}
```

### 4.3 List User Recommendations

```bash
curl -s http://localhost:3001/recommendations/demo-user-1 \
  -H "X-Events-API-Key: dev-events-key" | jq
```

**Expected output:**
```json
{
  "user_id": "demo-user-1",
  "count": 3,
  "recommendations": [
    {
      "candidate_id": "550e8400-...",
      "score": 0.85,
      "created_at": "2024-01-15T10:00:00.000Z",
      "class": "communication",
      "title": "Follow up on pending thread",
      "rationale": "Thread has been awaiting response for 3 days",
      "context_id": "thread-abc123"
    },
    ...
  ]
}
```

### 4.4 Get Single Recommendation

```bash
# Replace with actual candidate_id from previous response
CANDIDATE_ID="your-candidate-id-here"

curl -s http://localhost:3001/recommendations/demo-user-1/$CANDIDATE_ID \
  -H "X-Events-API-Key: dev-events-key" | jq
```

---

## 5. API Endpoints Test

### 5.1 Query User Signals

```bash
curl -s http://localhost:3001/events/signals/demo-user-1 \
  -H "X-Events-API-Key: dev-events-key" | jq
```

**Expected output:**
```json
{
  "activity_level": "medium",
  "primary_source": "mail",
  "pending_communications": 5,
  "upcoming_meetings": 2,
  "last_computed": "2024-01-15T10:00:00.000Z"
}
```

### 5.2 Query User Communications

```bash
curl -s http://localhost:3001/events/communications/demo-user-1 \
  -H "X-Events-API-Key: dev-events-key" | jq
```

**Expected output:**
```json
{
  "user_id": "demo-user-1",
  "open_threads": [
    { "thread_id": "thread-1", "last_activity": 1705312800000 }
  ],
  "awaiting_reply": ["thread-1", "thread-3"],
  "computed_at": "2024-01-15T10:00:00.000Z"
}
```

### 5.3 Query Upcoming Meetings

```bash
# Default: 24 hour window
curl -s http://localhost:3001/events/calendar/demo-user-1 \
  -H "X-Events-API-Key: dev-events-key" | jq

# Custom window (48 hours)
curl -s "http://localhost:3001/events/calendar/demo-user-1?window_hours=48" \
  -H "X-Events-API-Key: dev-events-key" | jq
```

**Expected output:**
```json
{
  "user_id": "demo-user-1",
  "window_hours": 24,
  "upcoming_meetings": [
    {
      "meeting_id": "meeting-abc",
      "scheduled_at": 1705320000000
    }
  ],
  "computed_at": "2024-01-15T10:00:00.000Z"
}
```

### 5.4 Query Daily Summary

```bash
# Get summary for specific date
curl -s http://localhost:3001/summaries/demo-user-1/2024-01-15 \
  -H "X-Events-API-Key: dev-events-key" | jq
```

**Expected output:**
```json
{
  "user_id": "demo-user-1",
  "date": "2024-01-15",
  "activity_level": "medium",
  "total_events": 35,
  "by_source": [
    { "source": "mail", "event_count": 15, "last_activity": "2024-01-15T14:30:00Z" }
  ],
  "communications": { ... },
  "meetings": { ... },
  "top_event_types": [ ... ],
  "generated_at": "2024-01-15T15:30:00Z"
}
```

---

## 6. Full Integration Test Script

Save this as `test-events-system.sh`:

```bash
#!/bin/bash

set -e

API_URL="http://localhost:3001"
API_KEY="dev-events-key"
USER_ID="integration-test-user"

echo "=== Event Logging & Recommendations Integration Test ==="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

pass() { echo -e "${GREEN}✓ $1${NC}"; }
fail() { echo -e "${RED}✗ $1${NC}"; exit 1; }

# 1. Prerequisites
echo "1. Checking prerequisites..."

redis-cli ping > /dev/null 2>&1 || fail "Redis not running"
pass "Redis is running"

READY=$(curl -s $API_URL/events/ready | jq -r '.ready')
[ "$READY" = "true" ] || fail "API not ready"
pass "API is ready"

# 2. Clear test user data
echo ""
echo "2. Clearing test user data..."
redis-cli DEL "state:user:$USER_ID:lastseen" > /dev/null
redis-cli DEL "state:user:$USER_ID:counts:1h" > /dev/null
redis-cli DEL "state:user:$USER_ID:counts:24h" > /dev/null
redis-cli DEL "reco:outbox:user:$USER_ID" > /dev/null
pass "Test user data cleared"

# 3. Ingest events
echo ""
echo "3. Testing event ingestion..."

RESULT=$(curl -s -X POST $API_URL/events/ingest \
  -H "Content-Type: application/json" \
  -H "X-Events-API-Key: $API_KEY" \
  -d "{
    \"event\": {
      \"user_id\": \"$USER_ID\",
      \"source\": \"mail\",
      \"type\": \"mail.received\",
      \"object\": { \"object_type\": \"email\", \"object_id\": \"email-001\" },
      \"context\": { \"thread_id\": \"thread-001\" }
    }
  }")

SUCCESS=$(echo $RESULT | jq -r '.success')
[ "$SUCCESS" = "true" ] || fail "Event ingestion failed: $RESULT"
pass "Single event ingested"

# 4. Batch ingest
RESULT=$(curl -s -X POST $API_URL/events/ingest/batch \
  -H "Content-Type: application/json" \
  -H "X-Events-API-Key: $API_KEY" \
  -d "{
    \"events\": [
      {
        \"user_id\": \"$USER_ID\",
        \"source\": \"mail\",
        \"type\": \"mail.sent\",
        \"object\": { \"object_type\": \"email\", \"object_id\": \"email-002\" },
        \"context\": { \"thread_id\": \"thread-001\" }
      },
      {
        \"user_id\": \"$USER_ID\",
        \"source\": \"caldav\",
        \"type\": \"calendar.event_scheduled\",
        \"object\": { \"object_type\": \"meeting\", \"object_id\": \"meeting-001\" },
        \"metadata\": { \"scheduled_at\": \"$(date -v+1H -u +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || date -d '+1 hour' -u +%Y-%m-%dT%H:%M:%SZ)\" }
      }
    ]
  }")

SUCCESSFUL=$(echo $RESULT | jq -r '.successful')
[ "$SUCCESSFUL" = "2" ] || fail "Batch ingestion failed: $RESULT"
pass "Batch events ingested (2 events)"

# 5. Wait for aggregation
echo ""
echo "4. Waiting for aggregation (2s)..."
sleep 2

# 6. Query user signals
echo ""
echo "5. Testing query endpoints..."

SIGNALS=$(curl -s $API_URL/events/signals/$USER_ID \
  -H "X-Events-API-Key: $API_KEY")

ACTIVITY=$(echo $SIGNALS | jq -r '.activity_level')
[ -n "$ACTIVITY" ] || fail "Failed to get user signals"
pass "User signals retrieved (activity: $ACTIVITY)"

# 7. Query communications
COMMS=$(curl -s $API_URL/events/communications/$USER_ID \
  -H "X-Events-API-Key: $API_KEY")

[ -n "$(echo $COMMS | jq -r '.user_id')" ] || fail "Failed to get communications"
pass "User communications retrieved"

# 8. Query calendar
CALENDAR=$(curl -s $API_URL/events/calendar/$USER_ID \
  -H "X-Events-API-Key: $API_KEY")

[ -n "$(echo $CALENDAR | jq -r '.user_id')" ] || fail "Failed to get calendar"
pass "User calendar retrieved"

# 9. List rules
echo ""
echo "6. Testing recommendations..."

RULES=$(curl -s $API_URL/recommendations/rules \
  -H "X-Events-API-Key: $API_KEY")

RULE_COUNT=$(echo $RULES | jq -r '.count')
[ "$RULE_COUNT" -gt 0 ] || fail "No rules registered"
pass "Rules listed ($RULE_COUNT rules)"

# 10. Generate recommendations
GENERATE=$(curl -s -X POST $API_URL/recommendations/$USER_ID/generate \
  -H "X-Events-API-Key: $API_KEY")

EVALUATED=$(echo $GENERATE | jq -r '.rules_evaluated')
[ "$EVALUATED" -gt 0 ] || fail "No rules evaluated"
pass "Recommendations generated (evaluated: $EVALUATED rules)"

# 11. List recommendations
RECOS=$(curl -s $API_URL/recommendations/$USER_ID \
  -H "X-Events-API-Key: $API_KEY")

RECO_COUNT=$(echo $RECOS | jq -r '.count')
pass "Recommendations listed ($RECO_COUNT candidates)"

# 12. Health check
echo ""
echo "7. System health..."

HEALTH=$(curl -s $API_URL/events/health \
  -H "X-Events-API-Key: $API_KEY")

STATUS=$(echo $HEALTH | jq -r '.status')
[ "$STATUS" = "healthy" ] || fail "System unhealthy: $STATUS"
pass "System is healthy"

# Summary
echo ""
echo "=== All Tests Passed ==="
echo "User: $USER_ID"
echo "Events ingested: 3"
echo "Rules evaluated: $RULE_COUNT"
echo "Recommendations: $RECO_COUNT"
```

Run the script:

```bash
chmod +x test-events-system.sh
./test-events-system.sh
```

---

## 7. Troubleshooting

### 7.1 Redis Connection Issues

**Problem:** `Could not connect to Redis`

```bash
# Check if Redis is running
docker ps | grep redis

# Start Redis if not running
docker compose up -d redis

# Verify connection
redis-cli ping
```

### 7.2 API Key Errors

**Problem:** `401 Unauthorized`

```bash
# Ensure you're using the correct header
curl -H "X-Events-API-Key: dev-events-key" ...

# Check your .env file has:
# EVENTS_API_KEY=dev-events-key  (or leave empty for dev mode)
```

### 7.3 Empty User State

**Problem:** Queries return empty data

```bash
# Check if events were ingested
redis-cli XLEN events:stream:mail
redis-cli XLEN events:stream:files

# Check aggregation keys exist
redis-cli KEYS "state:user:*"

# Force aggregation by ingesting a new event
# (aggregators run on event processing)
```

### 7.4 Recommendations Not Generating

**Problem:** `candidates_generated: 0`

```bash
# Check user has sufficient state data
curl -s http://localhost:3001/events/signals/your-user-id \
  -H "X-Events-API-Key: dev-events-key" | jq

# Check communications state (needed for most rules)
curl -s http://localhost:3001/events/communications/your-user-id \
  -H "X-Events-API-Key: dev-events-key" | jq

# Load demo data to create realistic state
npx tsx apps/api/src/events/cli/load-demo-data.ts
```

### 7.5 Clear All Test Data

```bash
# Clear all events streams
redis-cli KEYS "events:stream:*" | xargs -r redis-cli DEL

# Clear all dedup keys
redis-cli KEYS "events:dedup:*" | xargs -r redis-cli DEL

# Clear all user state
redis-cli KEYS "state:user:*" | xargs -r redis-cli DEL

# Clear all recommendations
redis-cli KEYS "reco:*" | xargs -r redis-cli DEL

# Or clear everything (use with caution!)
# redis-cli FLUSHDB
```

### 7.6 Check DLQ for Failed Events

```bash
# Get DLQ stats
curl -s http://localhost:3001/events/dlq/stats \
  -H "X-Events-API-Key: dev-events-key" | jq

# Inspect DLQ contents directly
redis-cli XRANGE events:dlq:mail - + COUNT 10
```

### 7.7 Run Unit Tests

```bash
# All events tests
npm run test:api -- --testPathPattern="events/test"

# All recommendations tests
npm run test:api -- --testPathPattern="recommendations"

# Specific rule tests
npm run test:api -- --testPathPattern="recommendations/rules/test"

# With coverage
npm run test:api -- --testPathPattern="events" --coverage
```

---

## Quick Reference

| Action | Command |
|--------|---------|
| Start Redis | `docker compose up -d redis` |
| Start API | `npm run api` |
| Load demo data | `npx tsx apps/api/src/events/cli/load-demo-data.ts` |
| Run tests | `npm run test:api` |
| Check health | `curl localhost:3001/events/health -H "X-Events-API-Key: dev-events-key"` |
| List rules | `curl localhost:3001/recommendations/rules -H "X-Events-API-Key: dev-events-key"` |
