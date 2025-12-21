#!/bin/bash

# =============================================================================
# Vollständiger Test-Flow: Events → Aggregation → Recommendations → Summary
# =============================================================================
#
# Voraussetzungen:
#   1. API läuft: npm run api
#   2. Redis läuft: docker compose up -d
#
# Verwendung:
#   ./scripts/curl-test-full-flow.sh
#
# =============================================================================

set -e

# Konfiguration
API_BASE="${API_BASE:-http://localhost:3001/edu-api}"
API_KEY="${API_KEY:-dev-events-key}"
AUTH="-H x-events-api-key:$API_KEY"
CT="-H Content-Type:application/json"
TEST_USER="lehrer-mueller"
TODAY=$(date +%Y-%m-%d)

# Farben
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo ""
echo -e "${CYAN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║     Vollständiger Test: Events → Recommendations → Summary   ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}API:${NC} $API_BASE"
echo -e "${YELLOW}User:${NC} $TEST_USER"
echo -e "${YELLOW}Datum:${NC} $TODAY"
echo ""

# =============================================================================
# SCHRITT 0: Voraussetzungen prüfen
# =============================================================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}SCHRITT 0: Voraussetzungen prüfen${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo "Prüfe ob API bereit ist..."
echo -e "${CYAN}curl $API_BASE/events/ready${NC}"
curl -s "$API_BASE/events/ready" | jq '.'
echo ""

echo "Prüfe Pipeline Health..."
echo -e "${CYAN}curl $AUTH $API_BASE/events/health${NC}"
curl -s $AUTH "$API_BASE/events/health" | jq '.status'
echo ""

# =============================================================================
# SCHRITT 1: Events generieren
# =============================================================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}SCHRITT 1: Events generieren${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# 1.1 Konferenz erstellen → sollte Folder + Chat empfehlen
echo -e "${GREEN}1.1 Konferenz erstellen (conference.created)${NC}"
CONF_ID="conf-mathe-$(date +%s)"
echo -e "${CYAN}curl -X POST $AUTH $CT $API_BASE/events/ingest${NC}"
curl -s -X POST $AUTH $CT "$API_BASE/events/ingest" -d '{
  "event": {
    "user_id": "'$TEST_USER'",
    "source": "conferences",
    "type": "conference.created",
    "object": {
      "object_type": "conference",
      "object_id": "'$CONF_ID'"
    },
    "metadata": {
      "subject_name": "Mathematik Klasse 8a",
      "scheduled_at": "'$(date -v+1d +%Y-%m-%dT10:00:00Z)'"
    },
    "sensitivity": "low"
  }
}' | jq '.'
echo ""

# 1.2 Umfrage erstellen → sollte Bulletin empfehlen
echo -e "${GREEN}1.2 Umfrage erstellen (survey.created)${NC}"
SURVEY_ID="survey-feedback-$(date +%s)"
echo -e "${CYAN}curl -X POST $AUTH $CT $API_BASE/events/ingest${NC}"
curl -s -X POST $AUTH $CT "$API_BASE/events/ingest" -d '{
  "event": {
    "user_id": "'$TEST_USER'",
    "source": "surveys",
    "type": "survey.created",
    "object": {
      "object_type": "survey",
      "object_id": "'$SURVEY_ID'"
    },
    "metadata": {
      "title": "Feedback Schuljahr 2024/25"
    },
    "sensitivity": "low"
  }
}' | jq '.'
echo ""

# 1.3 Klasse erstellen → sollte 5-Schritt Setup empfehlen
echo -e "${GREEN}1.3 Klasse erstellen (class.created)${NC}"
CLASS_ID="class-9b-$(date +%s)"
echo -e "${CYAN}curl -X POST $AUTH $CT $API_BASE/events/ingest${NC}"
curl -s -X POST $AUTH $CT "$API_BASE/events/ingest" -d '{
  "event": {
    "user_id": "'$TEST_USER'",
    "source": "system",
    "type": "class.created",
    "object": {
      "object_type": "class",
      "object_id": "'$CLASS_ID'"
    },
    "metadata": {
      "class_name": "9b",
      "students": ["schueler1", "schueler2", "schueler3"],
      "teachers": ["'$TEST_USER'"]
    },
    "sensitivity": "low"
  }
}' | jq '.'
echo ""

# 1.4 Prüfungs-Session starten → sollte Exam-Mode empfehlen
echo -e "${GREEN}1.4 Prüfungs-Session starten (session.started mit is_exam=true)${NC}"
SESSION_ID="session-exam-$(date +%s)"
echo -e "${CYAN}curl -X POST $AUTH $CT $API_BASE/events/ingest${NC}"
curl -s -X POST $AUTH $CT "$API_BASE/events/ingest" -d '{
  "event": {
    "user_id": "'$TEST_USER'",
    "source": "system",
    "type": "session.started",
    "object": {
      "object_type": "session",
      "object_id": "'$SESSION_ID'"
    },
    "metadata": {
      "class_name": "10a",
      "is_exam": true,
      "students": ["s1", "s2", "s3", "s4", "s5"]
    },
    "sensitivity": "low"
  }
}' | jq '.'
echo ""

# 1.5 Mail mit Anhängen → sollte Copy-File empfehlen
echo -e "${GREEN}1.5 Mail mit Anhängen empfangen (mail.received)${NC}"
MAIL_ID="mail-docs-$(date +%s)"
echo -e "${CYAN}curl -X POST $AUTH $CT $API_BASE/events/ingest${NC}"
curl -s -X POST $AUTH $CT "$API_BASE/events/ingest" -d '{
  "event": {
    "user_id": "'$TEST_USER'",
    "source": "mail",
    "type": "mail.received",
    "object": {
      "object_type": "mail",
      "object_id": "'$MAIL_ID'"
    },
    "metadata": {
      "subject": "Klassenfahrt Unterlagen",
      "has_attachments": true
    },
    "payload": {
      "attachments": [
        {"filename": "anmeldung.pdf", "temp_path": "/tmp/anmeldung.pdf", "size": 2048},
        {"filename": "kosten.xlsx", "temp_path": "/tmp/kosten.xlsx", "size": 1024}
      ]
    },
    "sensitivity": "medium"
  }
}' | jq '.'
echo ""

# 1.6 Wichtiges Bulletin → sollte Chat-Benachrichtigungen empfehlen
echo -e "${GREEN}1.6 Wichtiges Bulletin erstellen (bulletin.created)${NC}"
BULLETIN_ID="bulletin-wichtig-$(date +%s)"
echo -e "${CYAN}curl -X POST $AUTH $CT $API_BASE/events/ingest${NC}"
curl -s -X POST $AUTH $CT "$API_BASE/events/ingest" -d '{
  "event": {
    "user_id": "'$TEST_USER'",
    "source": "bulletin",
    "type": "bulletin.created",
    "object": {
      "object_type": "bulletin",
      "object_id": "'$BULLETIN_ID'"
    },
    "metadata": {
      "title": "Hitzefrei morgen!",
      "is_important": true
    },
    "payload": {
      "target_groups": [
        {"group_id": "g1", "name": "Lehrer", "chat_id": "chat-lehrer"},
        {"group_id": "g2", "name": "Eltern", "chat_id": "chat-eltern"},
        {"group_id": "g3", "name": "Schüler", "chat_id": "chat-schueler"}
      ]
    },
    "sensitivity": "low"
  }
}' | jq '.'
echo ""

# 1.7 Datei-Events für Activity
echo -e "${GREEN}1.7 Datei-Events für Activity-Tracking${NC}"
for i in 1 2 3 4 5; do
  curl -s -X POST $AUTH $CT "$API_BASE/events/ingest" -d '{
    "event": {
      "user_id": "'$TEST_USER'",
      "source": "files",
      "type": "file.accessed",
      "object": {
        "object_type": "file",
        "object_id": "file-'$i'-'$(date +%s)'"
      },
      "metadata": {
        "path": "/Dokumente/datei'$i'.pdf"
      },
      "sensitivity": "low"
    }
  }' > /dev/null
done
echo "5 file.accessed Events gesendet"
echo ""

# Kurze Pause für Aggregation
echo -e "${YELLOW}Warte 2 Sekunden für Event-Verarbeitung...${NC}"
sleep 2

# =============================================================================
# SCHRITT 2: User Signals & Activity prüfen
# =============================================================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}SCHRITT 2: User Signals & Activity${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo -e "${GREEN}2.1 User Signals abrufen${NC}"
echo -e "${CYAN}curl $AUTH $API_BASE/events/signals/$TEST_USER${NC}"
curl -s $AUTH "$API_BASE/events/signals/$TEST_USER" | jq '.'
echo ""

echo -e "${GREEN}2.2 Communications Status${NC}"
echo -e "${CYAN}curl $AUTH $API_BASE/events/communications/$TEST_USER${NC}"
curl -s $AUTH "$API_BASE/events/communications/$TEST_USER" | jq '.'
echo ""

echo -e "${GREEN}2.3 Upcoming Meetings (24h)${NC}"
echo -e "${CYAN}curl $AUTH $API_BASE/events/calendar/$TEST_USER${NC}"
curl -s $AUTH "$API_BASE/events/calendar/$TEST_USER" | jq '.'
echo ""

# =============================================================================
# SCHRITT 3: Recommendations generieren
# =============================================================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}SCHRITT 3: Recommendations generieren${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo -e "${GREEN}3.1 Recommendations generieren (force=true)${NC}"
echo -e "${CYAN}curl -X POST $AUTH '$API_BASE/recommendations/$TEST_USER/generate?force=true'${NC}"
curl -s -X POST $AUTH "$API_BASE/recommendations/$TEST_USER/generate?force=true" | jq '.'
echo ""

# =============================================================================
# SCHRITT 4: Recommendations mit action_proposal abrufen
# =============================================================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}SCHRITT 4: Recommendations mit Tool-Empfehlungen abrufen${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo -e "${GREEN}4.1 Alle Recommendations abrufen${NC}"
echo -e "${CYAN}curl $AUTH '$API_BASE/recommendations/$TEST_USER?limit=20'${NC}"
RECOS=$(curl -s $AUTH "$API_BASE/recommendations/$TEST_USER?limit=20")
echo "$RECOS" | jq '{count, recommendations: [.recommendations[] | {candidate_id, title, class, score}]}'
echo ""

echo -e "${GREEN}4.2 Nur Recommendations MIT action_proposal (Tool-Empfehlungen)${NC}"
echo "$RECOS" | jq '[.recommendations[] | select(.action_proposal != null) | {
  candidate_id,
  title,
  action_proposal: {
    title: .action_proposal.title,
    steps_count: (.action_proposal.steps | length),
    capabilities: [.action_proposal.steps[].capability],
    impact: .action_proposal.estimated_impact,
    reversible: .action_proposal.reversible
  }
}]'
echo ""

# Ersten Kandidaten mit action_proposal holen
CANDIDATE_ID=$(echo "$RECOS" | jq -r '[.recommendations[] | select(.action_proposal != null)][0].candidate_id // empty')

if [ -n "$CANDIDATE_ID" ]; then
  echo -e "${GREEN}4.3 Detail-Ansicht eines Kandidaten${NC}"
  echo -e "${CYAN}curl $AUTH $API_BASE/recommendations/$TEST_USER/$CANDIDATE_ID${NC}"
  curl -s $AUTH "$API_BASE/recommendations/$TEST_USER/$CANDIDATE_ID" | jq '{
    candidate_id,
    title,
    rationale,
    class,
    scores,
    action_proposal: {
      proposal_id: .action_proposal.proposal_id,
      title: .action_proposal.title,
      description: .action_proposal.description,
      steps: [.action_proposal.steps[] | {
        step_id,
        capability,
        description,
        params
      }],
      trigger: .action_proposal.trigger,
      reversible: .action_proposal.reversible,
      estimated_impact: .action_proposal.estimated_impact
    }
  }'
  echo ""

  echo -e "${GREEN}4.4 Why-Erklärung (Explainability)${NC}"
  echo -e "${CYAN}curl $AUTH $API_BASE/recommendations/$TEST_USER/$CANDIDATE_ID/why${NC}"
  curl -s $AUTH "$API_BASE/recommendations/$TEST_USER/$CANDIDATE_ID/why" | jq '.'
  echo ""
fi

# =============================================================================
# SCHRITT 5: Daily Summary
# =============================================================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}SCHRITT 5: Daily Summary${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo -e "${GREEN}5.1 Daily Summary für heute${NC}"
echo -e "${CYAN}curl $AUTH $API_BASE/summaries/$TEST_USER/$TODAY${NC}"
curl -s $AUTH "$API_BASE/summaries/$TEST_USER/$TODAY" | jq '.'
echo ""

# =============================================================================
# SCHRITT 6: Metrics & Health
# =============================================================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}SCHRITT 6: System Metrics${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo -e "${GREEN}6.1 Event Metrics${NC}"
echo -e "${CYAN}curl $AUTH $API_BASE/events/metrics${NC}"
curl -s $AUTH "$API_BASE/events/metrics" | jq '.'
echo ""

echo -e "${GREEN}6.2 Available Rules${NC}"
echo -e "${CYAN}curl $AUTH $API_BASE/recommendations/rules${NC}"
curl -s $AUTH "$API_BASE/recommendations/rules" | jq '{count, rules: [.rules[].id]}'
echo ""

# =============================================================================
# Zusammenfassung
# =============================================================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}TEST ABGESCHLOSSEN${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Generierte Test-IDs:"
echo "  - Conference: $CONF_ID"
echo "  - Survey:     $SURVEY_ID"
echo "  - Class:      $CLASS_ID"
echo "  - Session:    $SESSION_ID"
echo "  - Mail:       $MAIL_ID"
echo "  - Bulletin:   $BULLETIN_ID"
echo ""
echo -e "${YELLOW}Manuelle Befehle:${NC}"
echo ""
echo "# Alle Recommendations nochmal abrufen:"
echo "curl $AUTH '$API_BASE/recommendations/$TEST_USER?limit=20' | jq '.'"
echo ""
echo "# Nur Tool-Empfehlungen:"
echo "curl $AUTH '$API_BASE/recommendations/$TEST_USER' | jq '[.recommendations[] | select(.action_proposal)]'"
echo ""
echo "# Daily Summary:"
echo "curl $AUTH '$API_BASE/summaries/$TEST_USER/$TODAY' | jq '.'"
echo ""
