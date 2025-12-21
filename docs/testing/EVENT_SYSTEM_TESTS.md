# Event Logging System - Test Guide

This document provides complete testing instructions for the Event Logging System, including working curl commands and verification steps.

## Prerequisites

1. **Start the API server:**
   ```bash
   npm run api
   ```

2. **Ensure Redis is running:**
   ```bash
   docker compose up -d redis
   ```

3. **Verify API is accessible:**
   ```bash
   curl -s http://localhost:3001/edu-api/events/ready | jq
   ```

## Configuration

| Setting | Value | Notes |
|---------|-------|-------|
| API Port | 3001 | Set via EDUI_PORT |
| Global Prefix | edu-api | All endpoints start with this |
| Events Base | /edu-api/events | Events module root |
| Auth Header | x-events-api-key | Required for most endpoints |
| Dev API Key | dev-events-key | Auto-enabled in development |

## Test Commands

### 1. Health & Readiness

```bash
# Readiness check (no auth required)
curl -s http://localhost:3001/edu-api/events/ready | jq

# Expected response:
# {
#   "ready": true,
#   "timestamp": "2025-12-20T..."
# }

# Full health check (requires auth)
curl -s http://localhost:3001/edu-api/events/health \
  -H "x-events-api-key: dev-events-key" | jq

# Expected response includes streams and DLQ status:
# {
#   "status": "healthy",
#   "streams": { "files": {...}, "chat": {...}, ... },
#   "dlq": { "files": {...}, ... },
#   "last_checked": "..."
# }
```

### 2. Event Ingestion

#### Single Event
```bash
curl -s -X POST http://localhost:3001/edu-api/events/ingest \
  -H "Content-Type: application/json" \
  -H "x-events-api-key: dev-events-key" \
  -d '{
    "event": {
      "user_id": "test-user-001",
      "source": "files",
      "type": "file.created",
      "object": {
        "object_type": "file",
        "object_id": "file-abc-123"
      },
      "sensitivity": "low",
      "metadata": {
        "filename": "test-document.pdf",
        "size_bytes": 1024
      }
    },
    "idempotency_key": "test-file-create-001"
  }' | jq

# Expected response:
# {
#   "success": true,
#   "event_id": "...",
#   "stream_id": "...",
#   "deduplicated": false
# }
```

#### Batch Ingestion
```bash
curl -s -X POST http://localhost:3001/edu-api/events/ingest/batch \
  -H "Content-Type: application/json" \
  -H "x-events-api-key: dev-events-key" \
  -d '{
    "events": [
      {
        "user_id": "test-user-001",
        "source": "chat",
        "type": "chat.message_sent",
        "object": {
          "object_type": "message",
          "object_id": "msg-001"
        },
        "sensitivity": "medium"
      },
      {
        "user_id": "test-user-001",
        "source": "mail",
        "type": "mail.received",
        "object": {
          "object_type": "email",
          "object_id": "email-001"
        },
        "sensitivity": "medium"
      }
    ]
  }' | jq

# Expected response:
# {
#   "total": 2,
#   "successful": 2,
#   "deduplicated": 0,
#   "failed": 0,
#   "results": [...]
# }
```

### 3. Query Endpoints

#### User Signals
```bash
curl -s http://localhost:3001/edu-api/events/signals/test-user-001 \
  -H "x-events-api-key: dev-events-key" | jq
```

#### User Communications
```bash
curl -s http://localhost:3001/edu-api/events/communications/test-user-001 \
  -H "x-events-api-key: dev-events-key" | jq
```

#### User Calendar (with window)
```bash
curl -s "http://localhost:3001/edu-api/events/calendar/test-user-001?window_hours=48" \
  -H "x-events-api-key: dev-events-key" | jq
```

#### Context State
```bash
curl -s http://localhost:3001/edu-api/events/state/project-123 \
  -H "x-events-api-key: dev-events-key" | jq
```

#### Correlation Lookup
```bash
curl -s http://localhost:3001/edu-api/events/correlations/corr-abc-123 \
  -H "x-events-api-key: dev-events-key" | jq
```

### 4. Metrics & Monitoring

```bash
# Get metrics
curl -s http://localhost:3001/edu-api/events/metrics \
  -H "x-events-api-key: dev-events-key" | jq

# DLQ statistics
curl -s http://localhost:3001/edu-api/events/dlq/stats \
  -H "x-events-api-key: dev-events-key" | jq
```

### 5. Event Type Examples

#### Bulletin Events
```bash
# Bulletin created
curl -s -X POST http://localhost:3001/edu-api/events/ingest \
  -H "Content-Type: application/json" \
  -H "x-events-api-key: dev-events-key" \
  -d '{
    "event": {
      "user_id": "teacher-001",
      "source": "bulletin",
      "type": "bulletin.created",
      "object": {
        "object_type": "bulletin",
        "object_id": "bulletin-001"
      },
      "sensitivity": "low",
      "metadata": {
        "title": "Important Announcement",
        "targetGroups": ["class-10a", "class-10b"],
        "isActive": true
      }
    }
  }' | jq
```

#### Survey Events
```bash
# Survey created
curl -s -X POST http://localhost:3001/edu-api/events/ingest \
  -H "Content-Type: application/json" \
  -H "x-events-api-key: dev-events-key" \
  -d '{
    "event": {
      "user_id": "teacher-001",
      "source": "surveys",
      "type": "survey.created",
      "object": {
        "object_type": "survey",
        "object_id": "survey-001"
      },
      "sensitivity": "low",
      "metadata": {
        "title": "Feedback Survey",
        "questionCount": 5,
        "isPublic": false
      }
    }
  }' | jq

# Survey answer submitted
curl -s -X POST http://localhost:3001/edu-api/events/ingest \
  -H "Content-Type: application/json" \
  -H "x-events-api-key: dev-events-key" \
  -d '{
    "event": {
      "user_id": "student-001",
      "source": "surveys",
      "type": "survey.answer_submitted",
      "object": {
        "object_type": "survey_answer",
        "object_id": "answer-001"
      },
      "context": {
        "context_id": "survey-001"
      },
      "sensitivity": "medium"
    }
  }' | jq
```

#### Whiteboard Events
```bash
# Whiteboard session started
curl -s -X POST http://localhost:3001/edu-api/events/ingest \
  -H "Content-Type: application/json" \
  -H "x-events-api-key: dev-events-key" \
  -d '{
    "event": {
      "user_id": "teacher-001",
      "source": "whiteboard",
      "type": "whiteboard.session_started",
      "object": {
        "object_type": "whiteboard_session",
        "object_id": "room-abc-123"
      },
      "sensitivity": "low",
      "metadata": {
        "roomId": "room-abc-123",
        "isMultiUserRoom": true
      }
    }
  }' | jq
```

#### Conference Events
```bash
# Conference started
curl -s -X POST http://localhost:3001/edu-api/events/ingest \
  -H "Content-Type: application/json" \
  -H "x-events-api-key: dev-events-key" \
  -d '{
    "event": {
      "user_id": "teacher-001",
      "source": "conferences",
      "type": "conference.started",
      "object": {
        "object_type": "conference",
        "object_id": "conf-001"
      },
      "sensitivity": "low",
      "metadata": {
        "meetingName": "Math Class",
        "platform": "bbb"
      }
    }
  }' | jq
```

### 6. Demo Data Generation

Generate demo events for testing:

```bash
# Generate demo data (must be in api directory)
cd apps/api

# Generate with defaults
npx tsx src/events/cli/demo-data-generator.ts

# Generate with custom user count
npx tsx src/events/cli/demo-data-generator.ts --users 10

# Generate for specific user
npx tsx src/events/cli/demo-data-generator.ts --user specific-user-id
```

## Verification Steps

### Step 1: Verify API is Running
```bash
curl -s http://localhost:3001/edu-api/events/ready | jq '.ready'
# Should return: true
```

### Step 2: Verify Redis Connection
```bash
curl -s http://localhost:3001/edu-api/events/health \
  -H "x-events-api-key: dev-events-key" | jq '.status'
# Should return: "healthy"
```

### Step 3: Test Event Ingestion
```bash
# Ingest a test event
RESULT=$(curl -s -X POST http://localhost:3001/edu-api/events/ingest \
  -H "Content-Type: application/json" \
  -H "x-events-api-key: dev-events-key" \
  -d '{
    "event": {
      "user_id": "verify-test-user",
      "source": "files",
      "type": "file.created",
      "object": { "object_type": "file", "object_id": "verify-test-file" },
      "sensitivity": "low"
    }
  }')

echo "$RESULT" | jq '.success'
# Should return: true
```

### Step 4: Verify Idempotency
```bash
# Send same event twice with same idempotency key
for i in 1 2; do
  curl -s -X POST http://localhost:3001/edu-api/events/ingest \
    -H "Content-Type: application/json" \
    -H "x-events-api-key: dev-events-key" \
    -d '{
      "event": {
        "user_id": "idempotency-test-user",
        "source": "files",
        "type": "file.created",
        "object": { "object_type": "file", "object_id": "idem-test-file" },
        "sensitivity": "low"
      },
      "idempotency_key": "unique-idem-key-001"
    }' | jq '{success: .success, deduplicated: .deduplicated}'
done

# First should return: { "success": true, "deduplicated": false }
# Second should return: { "success": true, "deduplicated": true }
```

### Step 5: Verify Metrics
```bash
curl -s http://localhost:3001/edu-api/events/metrics \
  -H "x-events-api-key: dev-events-key" | jq '.events'
# Should show event counts > 0
```

## Troubleshooting

### API Not Responding
```bash
# Check if process is running
lsof -i :3001

# Check logs
npm run api 2>&1 | tail -50
```

### Redis Connection Failed
```bash
# Check Redis is running
docker ps | grep redis

# Start Redis if not running
docker compose up -d redis

# Test Redis directly
redis-cli ping
# Should return: PONG
```

### Authentication Errors
```bash
# Verify you're using the correct header
# Header name: x-events-api-key
# Dev value: dev-events-key

# Wrong (will fail):
curl -H "Authorization: Bearer dev-events-key" ...

# Correct:
curl -H "x-events-api-key: dev-events-key" ...
```

### Event Validation Errors
```bash
# Common issues:
# - Missing user_id (required)
# - Missing source (required)
# - Missing type (required)
# - Missing object.object_type (required)
# - Missing object.object_id (required)
# - Missing sensitivity (required: "low", "medium", or "high")
```

## Event Sources Reference

| Source | Description | Example Types |
|--------|-------------|---------------|
| files | File operations | file.created, file.moved, file.deleted |
| mail | Email events | mail.received, mail.sent |
| chat | Chat messages | chat.message_sent, chat.message_received |
| conferences | Video calls | conference.started, conference.ended |
| bulletin | Announcements | bulletin.created, bulletin.updated, bulletin.deleted |
| surveys | Surveys/forms | survey.created, survey.updated, survey.deleted, survey.answer_submitted |
| whiteboard | Collaborative drawing | whiteboard.session_started, whiteboard.session_ended |
| calendar | Calendar events | calendar.event_created, calendar.event_started |

## Running Automated Tests

```bash
# Run all event-related unit tests
npm run test:api -- --testPathPattern="events"

# Run demo data generator tests
npm run test:api -- --testPathPattern="demo-data-generator"

# Run with coverage
npm run coverage -- --testPathPattern="events"
```
