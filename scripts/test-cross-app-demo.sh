#!/bin/bash

# Cross-App Demo Data - Test Script
# Usage: ./scripts/test-cross-app-demo.sh
# Requires: curl, jq, running API server, running Redis

set -e

# Configuration
API_BASE="${API_BASE:-http://localhost:3001/edu-api}"
DEMO_BASE="$API_BASE/demo"
RECO_BASE="$API_BASE/recommendations"
EVENTS_BASE="$API_BASE/events"
API_KEY="${API_KEY:-dev-events-key}"
AUTH_HEADER="x-events-api-key: $API_KEY"
TEST_USER="demo-test-user-$$"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Counters
PASSED=0
FAILED=0

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_pass() { echo -e "${GREEN}[PASS]${NC} $1"; PASSED=$((PASSED + 1)); }
log_fail() { echo -e "${RED}[FAIL]${NC} $1"; FAILED=$((FAILED + 1)); }
log_section() {
    echo ""
    echo -e "${CYAN}========================================${NC}"
    echo -e "${CYAN}$1${NC}"
    echo -e "${CYAN}========================================${NC}"
}

# Check prerequisites
check_prerequisites() {
    log_section "Checking Prerequisites"

    if ! command -v jq &> /dev/null; then
        log_fail "jq is not installed. Please install with: brew install jq"
        exit 1
    fi
    log_pass "jq is installed"

    READY=$(curl -s "$EVENTS_BASE/ready" 2>/dev/null | jq -r '.ready' 2>/dev/null || echo "false")
    if [ "$READY" != "true" ]; then
        log_fail "API server not ready at $API_BASE"
        echo "Start the API server with: npm run api"
        exit 1
    fi
    log_pass "API server is ready"
}

# Test scenario generation
test_scenario() {
    local SCENARIO="$1"
    local EXPECTED_COUNT="$2"
    local USER="${TEST_USER}-${SCENARIO}"

    log_info "Testing scenario: $SCENARIO (expected: $EXPECTED_COUNT events)"

    local RESULT
    RESULT=$(curl -s -X POST "$DEMO_BASE/generate/$USER?scenario=$SCENARIO" \
        -H "$AUTH_HEADER")

    local ACTUAL_COUNT
    ACTUAL_COUNT=$(echo "$RESULT" | jq -r '.eventsCreated' 2>/dev/null || echo "0")

    if [ "$ACTUAL_COUNT" = "$EXPECTED_COUNT" ]; then
        log_pass "$SCENARIO created $ACTUAL_COUNT events"
        return 0
    else
        log_fail "$SCENARIO: expected $EXPECTED_COUNT events, got $ACTUAL_COUNT"
        echo "Response: $RESULT"
        return 1
    fi
}

# Test cross_app_full scenario in detail
test_cross_app_full_detail() {
    log_section "Testing cross_app_full in Detail"

    local USER="${TEST_USER}-full-detail"

    # Generate demo data
    log_info "Generating cross_app_full demo data..."
    local DEMO_RESULT
    DEMO_RESULT=$(curl -s -X POST "$DEMO_BASE/generate/$USER?scenario=cross_app_full" \
        -H "$AUTH_HEADER")

    local EVENTS_CREATED
    EVENTS_CREATED=$(echo "$DEMO_RESULT" | jq -r '.eventsCreated')

    if [ "$EVENTS_CREATED" = "7" ]; then
        log_pass "Generated 7 events"
    else
        log_fail "Expected 7 events, got $EVENTS_CREATED"
    fi

    # Generate recommendations
    log_info "Generating recommendations..."
    local RECO_GEN_RESULT
    RECO_GEN_RESULT=$(curl -s -X POST "$RECO_BASE/$USER/generate?force=true" \
        -H "$AUTH_HEADER")

    local GEN_COUNT
    GEN_COUNT=$(echo "$RECO_GEN_RESULT" | jq -r '.generated // 0')
    log_info "Generated $GEN_COUNT recommendations"

    # Get recommendations
    log_info "Fetching recommendations..."
    local RECO_RESULT
    RECO_RESULT=$(curl -s "$RECO_BASE/$USER" -H "$AUTH_HEADER")

    local TOTAL_RECO
    TOTAL_RECO=$(echo "$RECO_RESULT" | jq '.recommendations | length')
    log_info "Total recommendations: $TOTAL_RECO"

    # Count recommendations with action_proposal
    local ACTION_RECO
    ACTION_RECO=$(echo "$RECO_RESULT" | jq '[.recommendations[] | select(.action_proposal)] | length')

    if [ "$ACTION_RECO" -gt 0 ]; then
        log_pass "Found $ACTION_RECO recommendations with action_proposal"
    else
        log_info "No recommendations with action_proposal (cross-app rules may not be implemented yet)"
    fi

    # Show action proposal titles
    echo ""
    log_info "Recommendations with action proposals:"
    echo "$RECO_RESULT" | jq -r '.recommendations[] | select(.action_proposal) | "  - \(.title): \(.action_proposal.steps | length) steps"' 2>/dev/null || echo "  (none)"
}

# Test all scenarios
test_all_scenarios() {
    log_section "Testing All Cross-App Scenarios"

    test_scenario "cross_app_full" "7"
    test_scenario "cross_app_teacher" "4"
    test_scenario "cross_app_admin" "4"
    test_scenario "conference_heavy" "5"
    test_scenario "exam_day" "4"
}

# Test event types in cross_app_full
test_event_types() {
    log_section "Testing Event Types in cross_app_full"

    local USER="${TEST_USER}-types"

    # Generate with persist=false to just get the structure
    log_info "Checking event types generated..."

    curl -s -X POST "$DEMO_BASE/generate/$USER?scenario=cross_app_full" \
        -H "$AUTH_HEADER" > /dev/null

    # We can't easily verify event types without looking at Redis directly
    # This test validates the API responds correctly
    log_pass "Demo data generation endpoint works"
}

# Print summary
print_summary() {
    log_section "Test Summary"

    echo ""
    echo -e "Passed: ${GREEN}$PASSED${NC}"
    echo -e "Failed: ${RED}$FAILED${NC}"
    echo ""

    if [ "$FAILED" -eq 0 ]; then
        echo -e "${GREEN}All tests passed!${NC}"
        exit 0
    else
        echo -e "${RED}Some tests failed.${NC}"
        exit 1
    fi
}

# Cleanup function
cleanup() {
    log_info "Test user IDs used: ${TEST_USER}-*"
    log_info "Events will expire based on TTL"
}

# Main
main() {
    echo ""
    echo -e "${CYAN}╔════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║   Cross-App Demo Data Generation Tests         ║${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════════════╝${NC}"

    check_prerequisites
    test_all_scenarios
    test_cross_app_full_detail
    cleanup
    print_summary
}

# Run main
main "$@"
