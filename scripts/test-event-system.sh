#!/bin/bash

# Event Logging System - Automated Test Script
# Usage: ./scripts/test-event-system.sh
# Requires: curl, jq, running API server, running Redis

set -e

# Configuration
API_BASE="http://localhost:3001/edu-api"
EVENTS_BASE="$API_BASE/events"
API_KEY="dev-events-key"
AUTH_HEADER="x-events-api-key: $API_KEY"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
PASSED=0
FAILED=0
SKIPPED=0

# Helper functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_pass() {
    echo -e "${GREEN}[PASS]${NC} $1"
    PASSED=$((PASSED + 1))
}

log_fail() {
    echo -e "${RED}[FAIL]${NC} $1"
    FAILED=$((FAILED + 1))
}

log_skip() {
    echo -e "${YELLOW}[SKIP]${NC} $1"
    SKIPPED=$((SKIPPED + 1))
}

log_section() {
    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
}

# Test functions
test_ready_endpoint() {
    log_info "Testing readiness endpoint..."

    RESPONSE=$(curl -s "$EVENTS_BASE/ready" 2>/dev/null)
    if [ $? -ne 0 ]; then
        log_fail "Readiness endpoint - connection failed"
        return 1
    fi

    READY=$(echo "$RESPONSE" | jq -r '.ready' 2>/dev/null)
    if [ "$READY" = "true" ]; then
        log_pass "Readiness endpoint returns ready=true"
        return 0
    else
        log_fail "Readiness endpoint - ready=$READY (expected true)"
        return 1
    fi
}

test_health_endpoint() {
    log_info "Testing health endpoint..."

    RESPONSE=$(curl -s "$EVENTS_BASE/health" -H "$AUTH_HEADER" 2>/dev/null)
    if [ $? -ne 0 ]; then
        log_fail "Health endpoint - connection failed"
        return 1
    fi

    STATUS=$(echo "$RESPONSE" | jq -r '.status' 2>/dev/null)
    STREAMS=$(echo "$RESPONSE" | jq -r '.streams | keys | length' 2>/dev/null)

    if [ "$STATUS" = "healthy" ] && [ "$STREAMS" -gt 0 ]; then
        log_pass "Health endpoint - status=healthy, streams=$STREAMS"
        return 0
    else
        log_fail "Health endpoint - status=$STATUS, streams=$STREAMS"
        return 1
    fi
}

test_auth_required() {
    log_info "Testing authentication requirement..."

    RESPONSE=$(curl -s "$EVENTS_BASE/health" 2>/dev/null)
    ERROR=$(echo "$RESPONSE" | jq -r '.message' 2>/dev/null)

    if [[ "$ERROR" == *"API key"* ]] || [[ "$ERROR" == *"Unauthorized"* ]]; then
        log_pass "Authentication required for protected endpoints"
        return 0
    else
        log_fail "Authentication not enforced properly"
        return 1
    fi
}

test_single_event_ingest() {
    log_info "Testing single event ingestion..."

    TIMESTAMP=$(date +%s)
    RESPONSE=$(curl -s -X POST "$EVENTS_BASE/ingest" \
        -H "Content-Type: application/json" \
        -H "$AUTH_HEADER" \
        -d "{
            \"event\": {
                \"user_id\": \"test-user-$TIMESTAMP\",
                \"source\": \"files\",
                \"type\": \"file.created\",
                \"object\": {
                    \"object_type\": \"file\",
                    \"object_id\": \"file-$TIMESTAMP\"
                },
                \"sensitivity\": \"low\",
                \"metadata\": {
                    \"test\": true,
                    \"timestamp\": $TIMESTAMP
                }
            }
        }" 2>/dev/null)

    SUCCESS=$(echo "$RESPONSE" | jq -r '.success' 2>/dev/null)
    EVENT_ID=$(echo "$RESPONSE" | jq -r '.event_id' 2>/dev/null)

    if [ "$SUCCESS" = "true" ] && [ -n "$EVENT_ID" ] && [ "$EVENT_ID" != "null" ]; then
        log_pass "Single event ingestion - event_id=$EVENT_ID"
        return 0
    else
        log_fail "Single event ingestion failed: $RESPONSE"
        return 1
    fi
}

test_batch_ingest() {
    log_info "Testing batch event ingestion..."

    TIMESTAMP=$(date +%s)
    RESPONSE=$(curl -s -X POST "$EVENTS_BASE/ingest/batch" \
        -H "Content-Type: application/json" \
        -H "$AUTH_HEADER" \
        -d "{
            \"events\": [
                {
                    \"user_id\": \"batch-user-$TIMESTAMP\",
                    \"source\": \"chat\",
                    \"type\": \"chat.message_sent\",
                    \"object\": { \"object_type\": \"message\", \"object_id\": \"msg-1-$TIMESTAMP\" },
                    \"sensitivity\": \"medium\"
                },
                {
                    \"user_id\": \"batch-user-$TIMESTAMP\",
                    \"source\": \"mail\",
                    \"type\": \"mail.received\",
                    \"object\": { \"object_type\": \"email\", \"object_id\": \"email-1-$TIMESTAMP\" },
                    \"sensitivity\": \"medium\"
                },
                {
                    \"user_id\": \"batch-user-$TIMESTAMP\",
                    \"source\": \"files\",
                    \"type\": \"file.deleted\",
                    \"object\": { \"object_type\": \"file\", \"object_id\": \"file-1-$TIMESTAMP\" },
                    \"sensitivity\": \"low\"
                }
            ]
        }" 2>/dev/null)

    TOTAL=$(echo "$RESPONSE" | jq -r '.total' 2>/dev/null)
    SUCCESSFUL=$(echo "$RESPONSE" | jq -r '.successful' 2>/dev/null)

    if [ "$TOTAL" = "3" ] && [ "$SUCCESSFUL" = "3" ]; then
        log_pass "Batch ingestion - 3/3 events successful"
        return 0
    else
        log_fail "Batch ingestion - total=$TOTAL, successful=$SUCCESSFUL"
        return 1
    fi
}

test_idempotency() {
    log_info "Testing event idempotency..."

    IDEM_KEY="test-idem-$(date +%s)"

    # First request
    RESPONSE1=$(curl -s -X POST "$EVENTS_BASE/ingest" \
        -H "Content-Type: application/json" \
        -H "$AUTH_HEADER" \
        -d "{
            \"event\": {
                \"user_id\": \"idem-test-user\",
                \"source\": \"files\",
                \"type\": \"file.created\",
                \"object\": { \"object_type\": \"file\", \"object_id\": \"idem-file\" },
                \"sensitivity\": \"low\"
            },
            \"idempotency_key\": \"$IDEM_KEY\"
        }" 2>/dev/null)

    DEDUP1=$(echo "$RESPONSE1" | jq -r '.deduplicated' 2>/dev/null)

    # Second request with same key
    RESPONSE2=$(curl -s -X POST "$EVENTS_BASE/ingest" \
        -H "Content-Type: application/json" \
        -H "$AUTH_HEADER" \
        -d "{
            \"event\": {
                \"user_id\": \"idem-test-user\",
                \"source\": \"files\",
                \"type\": \"file.created\",
                \"object\": { \"object_type\": \"file\", \"object_id\": \"idem-file\" },
                \"sensitivity\": \"low\"
            },
            \"idempotency_key\": \"$IDEM_KEY\"
        }" 2>/dev/null)

    DEDUP2=$(echo "$RESPONSE2" | jq -r '.deduplicated' 2>/dev/null)

    if [ "$DEDUP1" = "false" ] && [ "$DEDUP2" = "true" ]; then
        log_pass "Idempotency - first=new, second=deduplicated"
        return 0
    else
        log_fail "Idempotency - first dedup=$DEDUP1, second dedup=$DEDUP2"
        return 1
    fi
}

test_user_signals() {
    log_info "Testing user signals endpoint..."

    RESPONSE=$(curl -s "$EVENTS_BASE/signals/test-user-001" -H "$AUTH_HEADER" 2>/dev/null)

    if [ $? -eq 0 ] && [ -n "$RESPONSE" ]; then
        log_pass "User signals endpoint responds"
        return 0
    else
        log_fail "User signals endpoint failed"
        return 1
    fi
}

test_metrics_endpoint() {
    log_info "Testing metrics endpoint..."

    RESPONSE=$(curl -s "$EVENTS_BASE/metrics" -H "$AUTH_HEADER" 2>/dev/null)

    UPTIME=$(echo "$RESPONSE" | jq -r '.uptime_ms' 2>/dev/null)

    if [ -n "$UPTIME" ] && [ "$UPTIME" != "null" ]; then
        log_pass "Metrics endpoint - uptime=${UPTIME}ms"
        return 0
    else
        log_fail "Metrics endpoint failed: $RESPONSE"
        return 1
    fi
}

test_dlq_stats() {
    log_info "Testing DLQ stats endpoint..."

    RESPONSE=$(curl -s "$EVENTS_BASE/dlq/stats" -H "$AUTH_HEADER" 2>/dev/null)

    if [ $? -eq 0 ] && [ -n "$RESPONSE" ]; then
        log_pass "DLQ stats endpoint responds"
        return 0
    else
        log_fail "DLQ stats endpoint failed"
        return 1
    fi
}

test_bulletin_event() {
    log_info "Testing bulletin event ingestion..."

    TIMESTAMP=$(date +%s)
    RESPONSE=$(curl -s -X POST "$EVENTS_BASE/ingest" \
        -H "Content-Type: application/json" \
        -H "$AUTH_HEADER" \
        -d "{
            \"event\": {
                \"user_id\": \"teacher-$TIMESTAMP\",
                \"source\": \"bulletin\",
                \"type\": \"bulletin.created\",
                \"object\": {
                    \"object_type\": \"bulletin\",
                    \"object_id\": \"bulletin-$TIMESTAMP\"
                },
                \"sensitivity\": \"low\",
                \"metadata\": {
                    \"title\": \"Test Announcement\",
                    \"isActive\": true
                }
            }
        }" 2>/dev/null)

    SUCCESS=$(echo "$RESPONSE" | jq -r '.success' 2>/dev/null)

    if [ "$SUCCESS" = "true" ]; then
        log_pass "Bulletin event ingested successfully"
        return 0
    else
        log_fail "Bulletin event failed: $RESPONSE"
        return 1
    fi
}

test_survey_event() {
    log_info "Testing survey event ingestion..."

    TIMESTAMP=$(date +%s)
    RESPONSE=$(curl -s -X POST "$EVENTS_BASE/ingest" \
        -H "Content-Type: application/json" \
        -H "$AUTH_HEADER" \
        -d "{
            \"event\": {
                \"user_id\": \"teacher-$TIMESTAMP\",
                \"source\": \"surveys\",
                \"type\": \"survey.created\",
                \"object\": {
                    \"object_type\": \"survey\",
                    \"object_id\": \"survey-$TIMESTAMP\"
                },
                \"sensitivity\": \"low\",
                \"metadata\": {
                    \"title\": \"Test Survey\",
                    \"questionCount\": 5
                }
            }
        }" 2>/dev/null)

    SUCCESS=$(echo "$RESPONSE" | jq -r '.success' 2>/dev/null)

    if [ "$SUCCESS" = "true" ]; then
        log_pass "Survey event ingested successfully"
        return 0
    else
        log_fail "Survey event failed: $RESPONSE"
        return 1
    fi
}

test_whiteboard_event() {
    log_info "Testing whiteboard event ingestion..."

    TIMESTAMP=$(date +%s)
    RESPONSE=$(curl -s -X POST "$EVENTS_BASE/ingest" \
        -H "Content-Type: application/json" \
        -H "$AUTH_HEADER" \
        -d "{
            \"event\": {
                \"user_id\": \"user-$TIMESTAMP\",
                \"source\": \"whiteboard\",
                \"type\": \"whiteboard.session_started\",
                \"object\": {
                    \"object_type\": \"whiteboard_session\",
                    \"object_id\": \"room-$TIMESTAMP\"
                },
                \"sensitivity\": \"low\",
                \"metadata\": {
                    \"isMultiUserRoom\": true
                }
            }
        }" 2>/dev/null)

    SUCCESS=$(echo "$RESPONSE" | jq -r '.success' 2>/dev/null)

    if [ "$SUCCESS" = "true" ]; then
        log_pass "Whiteboard event ingested successfully"
        return 0
    else
        log_fail "Whiteboard event failed: $RESPONSE"
        return 1
    fi
}

test_conference_event() {
    log_info "Testing conference event ingestion..."

    TIMESTAMP=$(date +%s)
    RESPONSE=$(curl -s -X POST "$EVENTS_BASE/ingest" \
        -H "Content-Type: application/json" \
        -H "$AUTH_HEADER" \
        -d "{
            \"event\": {
                \"user_id\": \"teacher-$TIMESTAMP\",
                \"source\": \"conferences\",
                \"type\": \"conference.started\",
                \"object\": {
                    \"object_type\": \"conference\",
                    \"object_id\": \"conf-$TIMESTAMP\"
                },
                \"sensitivity\": \"low\",
                \"metadata\": {
                    \"meetingName\": \"Test Meeting\",
                    \"platform\": \"bbb\"
                }
            }
        }" 2>/dev/null)

    SUCCESS=$(echo "$RESPONSE" | jq -r '.success' 2>/dev/null)

    if [ "$SUCCESS" = "true" ]; then
        log_pass "Conference event ingested successfully"
        return 0
    else
        log_fail "Conference event failed: $RESPONSE"
        return 1
    fi
}

test_invalid_event() {
    log_info "Testing invalid event rejection..."

    RESPONSE=$(curl -s -X POST "$EVENTS_BASE/ingest" \
        -H "Content-Type: application/json" \
        -H "$AUTH_HEADER" \
        -d "{
            \"event\": {
                \"source\": \"files\",
                \"type\": \"file.created\"
            }
        }" 2>/dev/null)

    SUCCESS=$(echo "$RESPONSE" | jq -r '.success' 2>/dev/null)
    ERROR=$(echo "$RESPONSE" | jq -r '.error' 2>/dev/null)

    if [ "$SUCCESS" = "false" ] && [ -n "$ERROR" ] && [ "$ERROR" != "null" ]; then
        log_pass "Invalid event rejected with error message"
        return 0
    else
        log_fail "Invalid event not rejected properly: $RESPONSE"
        return 1
    fi
}

# Main execution
main() {
    echo ""
    echo -e "${BLUE}╔══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║     Event Logging System - Automated Test Suite          ║${NC}"
    echo -e "${BLUE}╚══════════════════════════════════════════════════════════╝${NC}"
    echo ""

    log_info "API Base: $API_BASE"
    log_info "Events Base: $EVENTS_BASE"
    echo ""

    # Check prerequisites
    log_section "Prerequisites Check"

    if ! command -v curl &> /dev/null; then
        log_fail "curl is not installed"
        exit 1
    fi
    log_pass "curl is available"

    if ! command -v jq &> /dev/null; then
        log_fail "jq is not installed"
        exit 1
    fi
    log_pass "jq is available"

    # Test API availability
    if ! test_ready_endpoint; then
        echo ""
        log_fail "API is not running. Start with: npm run api"
        exit 1
    fi

    # Run test suites
    log_section "Core Functionality Tests"
    test_health_endpoint
    test_auth_required
    test_metrics_endpoint
    test_dlq_stats

    log_section "Event Ingestion Tests"
    test_single_event_ingest
    test_batch_ingest
    test_idempotency
    test_invalid_event

    log_section "Query Endpoint Tests"
    test_user_signals

    log_section "Event Type Tests"
    test_bulletin_event
    test_survey_event
    test_whiteboard_event
    test_conference_event

    # Summary
    log_section "Test Summary"
    echo ""
    echo -e "  ${GREEN}Passed:${NC}  $PASSED"
    echo -e "  ${RED}Failed:${NC}  $FAILED"
    echo -e "  ${YELLOW}Skipped:${NC} $SKIPPED"
    echo ""

    TOTAL=$((PASSED + FAILED))
    if [ $FAILED -eq 0 ]; then
        echo -e "${GREEN}All $TOTAL tests passed!${NC}"
        exit 0
    else
        echo -e "${RED}$FAILED of $TOTAL tests failed${NC}"
        exit 1
    fi
}

# Run main
main "$@"
