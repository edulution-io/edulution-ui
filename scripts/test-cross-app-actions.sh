#!/bin/bash

# Cross-App Action System - Test Script
# Usage: ./scripts/test-cross-app-actions.sh
# Requires: curl, jq, running API server, running Redis

set -e

# Configuration
API_BASE="${API_BASE:-http://localhost:3001/edu-api}"
EVENTS_BASE="$API_BASE/events"
RECO_BASE="$API_BASE/recommendations"
API_KEY="${API_KEY:-dev-events-key}"
AUTH_HEADER="x-events-api-key: $API_KEY"
TEST_USER="test-user-cross-app"

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

# Helper: Ingest an event
ingest_event() {
    local EVENT_JSON="$1"
    curl -s -X POST "$EVENTS_BASE/ingest" \
        -H "$AUTH_HEADER" \
        -H "Content-Type: application/json" \
        -d "$EVENT_JSON"
}

# Helper: Generate recommendations
generate_recommendations() {
    local USER_ID="$1"
    local FORCE="${2:-true}"
    curl -s -X POST "$RECO_BASE/$USER_ID/generate?force=$FORCE" \
        -H "$AUTH_HEADER"
}

# Helper: List recommendations
list_recommendations() {
    local USER_ID="$1"
    curl -s "$RECO_BASE/$USER_ID" -H "$AUTH_HEADER"
}

# Helper: Get single candidate
get_candidate() {
    local USER_ID="$1"
    local CANDIDATE_ID="$2"
    curl -s "$RECO_BASE/$USER_ID/$CANDIDATE_ID" -H "$AUTH_HEADER"
}

# =====================================================
# Test 1: Conference Setup Rule
# =====================================================
test_conference_setup() {
    log_section "Test 1: Conference Setup Rule"
    log_info "Trigger: conference.created → folder + chat"

    local CONF_ID="conf-test-$(date +%s)"
    local EVENT='{
        "event": {
            "user_id": "'$TEST_USER'",
            "source": "conferences",
            "type": "conference.created",
            "object": {
                "object_type": "conference",
                "object_id": "'$CONF_ID'"
            },
            "metadata": {
                "subject_name": "Mathematik",
                "scheduled_at": "2025-03-15T10:00:00Z"
            },
            "sensitivity": "low"
        }
    }'

    log_info "Ingesting conference.created event..."
    RESULT=$(ingest_event "$EVENT")
    SUCCESS=$(echo "$RESULT" | jq -r '.success')

    if [ "$SUCCESS" = "true" ]; then
        log_pass "Event ingested: $(echo "$RESULT" | jq -r '.event_id')"
    else
        log_fail "Failed to ingest event: $(echo "$RESULT" | jq -r '.error')"
        return 1
    fi

    log_info "Generating recommendations..."
    generate_recommendations "$TEST_USER" > /dev/null

    log_info "Checking for action_proposal..."
    RECOS=$(list_recommendations "$TEST_USER")
    echo "$RECOS" | jq '.recommendations[] | select(.action_proposal != null) | {title, action_proposal: {steps: .action_proposal.steps | length, reversible: .action_proposal.reversible}}'
}

# =====================================================
# Test 2: Survey Announce Rule
# =====================================================
test_survey_announce() {
    log_section "Test 2: Survey Announce Rule"
    log_info "Trigger: survey.created → bulletin"

    local SURVEY_ID="survey-test-$(date +%s)"
    local EVENT='{
        "event": {
            "user_id": "'$TEST_USER'",
            "source": "surveys",
            "type": "survey.created",
            "object": {
                "object_type": "survey",
                "object_id": "'$SURVEY_ID'"
            },
            "metadata": {
                "title": "Feedback-Umfrage Q1"
            },
            "sensitivity": "low"
        }
    }'

    log_info "Ingesting survey.created event..."
    RESULT=$(ingest_event "$EVENT")
    SUCCESS=$(echo "$RESULT" | jq -r '.success')

    if [ "$SUCCESS" = "true" ]; then
        log_pass "Event ingested: $(echo "$RESULT" | jq -r '.event_id')"
    else
        log_fail "Failed to ingest event"
    fi
}

# =====================================================
# Test 3: Class Setup Rule (5 steps)
# =====================================================
test_class_setup() {
    log_section "Test 3: Class Setup Rule"
    log_info "Trigger: class.created → 3 folders + chat + bulletin"

    local CLASS_ID="class-test-$(date +%s)"
    local EVENT='{
        "event": {
            "user_id": "'$TEST_USER'",
            "source": "system",
            "type": "class.created",
            "object": {
                "object_type": "class",
                "object_id": "'$CLASS_ID'"
            },
            "metadata": {
                "class_name": "8a",
                "students": ["student1", "student2"],
                "teachers": ["teacher1"]
            },
            "sensitivity": "low"
        }
    }'

    log_info "Ingesting class.created event..."
    RESULT=$(ingest_event "$EVENT")
    echo "$RESULT" | jq '.'
}

# =====================================================
# Test 4: Session Exam Rule (high impact)
# =====================================================
test_session_exam() {
    log_section "Test 4: Session Exam Rule"
    log_info "Trigger: session.started (is_exam=true) → folder + exam_mode"

    local SESSION_ID="session-test-$(date +%s)"
    local EVENT='{
        "event": {
            "user_id": "'$TEST_USER'",
            "source": "system",
            "type": "session.started",
            "object": {
                "object_type": "session",
                "object_id": "'$SESSION_ID'"
            },
            "metadata": {
                "class_name": "10b",
                "is_exam": true,
                "students": ["s1", "s2", "s3"]
            },
            "sensitivity": "low"
        }
    }'

    log_info "Ingesting session.started (exam) event..."
    RESULT=$(ingest_event "$EVENT")
    echo "$RESULT" | jq '.'
}

# =====================================================
# Test 5: Mail Attachment Rule
# =====================================================
test_mail_attachment() {
    log_section "Test 5: Mail Attachment Rule"
    log_info "Trigger: mail.received (has_attachments=true) → copy_file per attachment"

    local MAIL_ID="mail-test-$(date +%s)"
    local EVENT='{
        "event": {
            "user_id": "'$TEST_USER'",
            "source": "mail",
            "type": "mail.received",
            "object": {
                "object_type": "mail",
                "object_id": "'$MAIL_ID'"
            },
            "metadata": {
                "subject": "Wichtige Dokumente",
                "has_attachments": true
            },
            "payload": {
                "attachments": [
                    {"filename": "report.pdf", "temp_path": "/tmp/report.pdf", "size": 1024},
                    {"filename": "data.xlsx", "temp_path": "/tmp/data.xlsx", "size": 2048}
                ]
            },
            "sensitivity": "medium"
        }
    }'

    log_info "Ingesting mail.received event with attachments..."
    RESULT=$(ingest_event "$EVENT")
    echo "$RESULT" | jq '.'
}

# =====================================================
# Test 6: Bulletin Notify Rule
# =====================================================
test_bulletin_notify() {
    log_section "Test 6: Bulletin Notify Rule"
    log_info "Trigger: bulletin.created (is_important=true) → send_message per group"

    local BULLETIN_ID="bulletin-test-$(date +%s)"
    local EVENT='{
        "event": {
            "user_id": "'$TEST_USER'",
            "source": "bulletin",
            "type": "bulletin.created",
            "object": {
                "object_type": "bulletin",
                "object_id": "'$BULLETIN_ID'"
            },
            "metadata": {
                "title": "Schulausfall morgen",
                "is_important": true
            },
            "payload": {
                "target_groups": [
                    {"group_id": "g1", "name": "Lehrer", "chat_id": "chat-teachers"},
                    {"group_id": "g2", "name": "Eltern", "chat_id": "chat-parents"}
                ]
            },
            "sensitivity": "low"
        }
    }'

    log_info "Ingesting bulletin.created (important) event..."
    RESULT=$(ingest_event "$EVENT")
    echo "$RESULT" | jq '.'
}

# =====================================================
# Test 7: Project Setup Rule
# =====================================================
test_project_setup() {
    log_section "Test 7: Project Setup Rule"
    log_info "Trigger: project.created → folder + chat + share"

    local PROJECT_ID="project-test-$(date +%s)"
    local EVENT='{
        "event": {
            "user_id": "'$TEST_USER'",
            "source": "system",
            "type": "project.created",
            "object": {
                "object_type": "project",
                "object_id": "'$PROJECT_ID'"
            },
            "metadata": {
                "project_name": "Science Fair 2025",
                "members": ["m1", "m2", "m3"]
            },
            "sensitivity": "low"
        }
    }'

    log_info "Ingesting project.created event..."
    RESULT=$(ingest_event "$EVENT")
    echo "$RESULT" | jq '.'
}

# =====================================================
# Verify Recommendations with action_proposal
# =====================================================
verify_action_proposals() {
    log_section "Verifying Action Proposals"

    log_info "Fetching all recommendations for $TEST_USER..."
    RECOS=$(list_recommendations "$TEST_USER")

    COUNT=$(echo "$RECOS" | jq '.count')
    log_info "Total recommendations: $COUNT"

    echo ""
    echo "Recommendations with action_proposal:"
    echo "$RECOS" | jq '.recommendations[] | select(.action_proposal != null) | {
        candidate_id,
        title,
        class,
        action_proposal: {
            proposal_id: .action_proposal.proposal_id,
            title: .action_proposal.title,
            steps_count: (.action_proposal.steps | length),
            capabilities: [.action_proposal.steps[].capability],
            reversible: .action_proposal.reversible,
            estimated_impact: .action_proposal.estimated_impact
        }
    }'
}

# =====================================================
# Show Curl Examples
# =====================================================
show_curl_examples() {
    log_section "Curl Command Examples"

    echo ""
    echo -e "${YELLOW}1. Ingest a conference.created event:${NC}"
    cat << 'EOF'
curl -X POST "http://localhost:3001/edu-api/events/ingest" \
  -H "x-events-api-key: dev-events-key" \
  -H "Content-Type: application/json" \
  -d '{
    "event": {
      "user_id": "teacher-1",
      "source": "conferences",
      "type": "conference.created",
      "object": {
        "object_type": "conference",
        "object_id": "conf-12345"
      },
      "metadata": {
        "subject_name": "Mathematik",
        "scheduled_at": "2025-03-15T10:00:00Z"
      },
      "sensitivity": "low"
    }
  }'
EOF

    echo ""
    echo -e "${YELLOW}2. Generate recommendations:${NC}"
    cat << 'EOF'
curl -X POST "http://localhost:3001/edu-api/recommendations/teacher-1/generate?force=true" \
  -H "x-events-api-key: dev-events-key"
EOF

    echo ""
    echo -e "${YELLOW}3. List recommendations with action_proposal:${NC}"
    cat << 'EOF'
curl "http://localhost:3001/edu-api/recommendations/teacher-1" \
  -H "x-events-api-key: dev-events-key" | jq '.recommendations[] | select(.action_proposal)'
EOF

    echo ""
    echo -e "${YELLOW}4. Get single candidate details:${NC}"
    cat << 'EOF'
curl "http://localhost:3001/edu-api/recommendations/teacher-1/CANDIDATE_ID" \
  -H "x-events-api-key: dev-events-key" | jq '.'
EOF

    echo ""
    echo -e "${YELLOW}5. Get explainability (why):${NC}"
    cat << 'EOF'
curl "http://localhost:3001/edu-api/recommendations/teacher-1/CANDIDATE_ID/why" \
  -H "x-events-api-key: dev-events-key" | jq '.'
EOF
}

# =====================================================
# Run Automated Tests
# =====================================================
run_automated_tests() {
    log_section "Running Automated Jest Tests"

    echo ""
    echo "Run cross-app rule tests:"
    echo -e "${CYAN}npx jest --testPathPattern=\"cross-app.spec\" --verbose${NC}"
    echo ""
    echo "Run all recommendation tests:"
    echo -e "${CYAN}npx jest --testPathPattern=\"recommendations\" --verbose${NC}"
    echo ""
    echo "Run specific rule test:"
    echo -e "${CYAN}npx jest --testPathPattern=\"cross-app.spec\" -t \"ConferenceSetupRule\"${NC}"
}

# =====================================================
# Main
# =====================================================
main() {
    echo ""
    echo -e "${CYAN}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║       Cross-App Action System - Integration Test Suite       ║${NC}"
    echo -e "${CYAN}╚══════════════════════════════════════════════════════════════╝${NC}"

    check_prerequisites

    # Run all tests
    test_conference_setup
    test_survey_announce
    test_class_setup
    test_session_exam
    test_mail_attachment
    test_bulletin_notify
    test_project_setup

    verify_action_proposals
    show_curl_examples
    run_automated_tests

    # Summary
    log_section "Test Summary"
    echo -e "Passed: ${GREEN}$PASSED${NC}"
    echo -e "Failed: ${RED}$FAILED${NC}"
    echo ""

    if [ $FAILED -gt 0 ]; then
        exit 1
    fi
}

# Run with optional flags
case "${1:-}" in
    --curl-only)
        show_curl_examples
        ;;
    --tests-only)
        run_automated_tests
        ;;
    *)
        main
        ;;
esac
