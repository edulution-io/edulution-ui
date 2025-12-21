# Thesis Diagrams: Cross-App Intelligence System

**Thesis:** "Cross-App-Intelligenz in Echtzeit: Systementwurf und empirische Evidenz für agentische Personalisierung"

**Autor:** Martin Hummel | **Datum:** 2025-12-21

---

## Inhaltsverzeichnis

1. [Systemarchitektur](#1-systemarchitektur)
2. [Event-zu-Empfehlung Fluss](#2-event-zu-empfehlung-fluss)
3. [Beispiel: E-Mail mit Anhängen](#3-beispiel-e-mail-mit-anhängen)
4. [Beispiel: Konferenz-Workspace](#4-beispiel-konferenz-workspace)
5. [Multi-Source Aggregation](#5-multi-source-aggregation)
6. [Timeline: DEV-Modus](#6-timeline-dev-modus)
7. [Timeline: PROD-Modus](#7-timeline-prod-modus)
8. [DEV vs PROD Vergleich](#8-dev-vs-prod-vergleich)
9. [Klassen-Priorität (Ablation)](#9-klassen-priorität-ablation)
10. [Action Execution Flow](#10-action-execution-flow)
11. [Cache-Strategie](#11-cache-strategie)

---

## 1. Systemarchitektur

**Kapitel:** 3. Systemarchitektur

**Beschreibung:** Zeigt die Gesamtarchitektur des Systems von den Eventquellen über die Verarbeitung bis zur Ausgabe.

**Kernpunkte:**
- 5 primäre Eventquellen (SOGo Mail/Calendar, WebDAV, BBB, Rocket.Chat)
- Zentrale Event-Ingestion via REST API
- 7 implementierte Cross-App Rules
- Multi-Target Output (Empfehlungen, Daily Plan, Push)

```mermaid
flowchart TB
    subgraph Sources["Event Sources"]
        Mail[("Mail\nSOGo")]
        Cal[("Calendar\nSOGo")]
        Files[("Files\nWebDAV")]
        Conf[("Conferences\nBBB")]
        Chat[("Chat\nRocket.Chat")]
    end

    subgraph Ingestion["Event Ingestion Layer"]
        API[["Events API\n/events/ingest"]]
        Norm["Event Normalizer\n+ Validation"]
        Store[("Redis Streams\nEvent Store")]
    end

    subgraph Processing["Cross-App Processing"]
        Eval["Cross-App\nEvaluator"]
        Rules["Rule Engine"]
        Dedup["Content-Based\nDeduplication"]
    end

    subgraph RulesDetail["Implemented Rules"]
        R1["mail-attachment.rule"]
        R2["conference-workspace.rule"]
        R3["project-setup.rule"]
        R4["session-exam.rule"]
        R5["survey-announce.rule"]
        R6["bulletin-notify.rule"]
        R7["class-setup.rule"]
    end

    subgraph Output["Output Layer"]
        Recos[("Recommendations\nRedis + MongoDB")]
        Plan["Daily Plan\nLLM Generated"]
        Push["Push\nNotification"]
    end

    Mail --> API
    Cal --> API
    Files --> API
    Conf --> API
    Chat --> API

    API --> Norm --> Store
    Store --> Eval
    Eval --> Rules
    Rules --> RulesDetail
    RulesDetail --> Dedup
    Dedup --> Recos
    Recos --> Plan
    Plan --> Push
```

---

## 2. Event-zu-Empfehlung Fluss

**Kapitel:** 4. Implementierung

**Beschreibung:** Detaillierte Transformation eines Raw Events zu einem gespeicherten Recommendation Candidate.

**Kernpunkte:**
- Event enthält type, source, metadata
- Rule evaluiert Bedingungen (z.B. has_attachments)
- Action Proposal wird mit ausführbaren Schritten generiert
- Content-basierte Deduplizierung verhindert Duplikate
- Dual Storage: Redis (schnell, 24h) + MongoDB (persistent)

```mermaid
flowchart LR
    subgraph Event["Raw Event"]
        E1["type: mail.received"]
        E2["source: mail"]
        E3["metadata:\n  subject: 'Unterricht'\n  attachments: 2"]
        E4["payload:\n  filenames: [...]"]
    end

    subgraph Rule["Rule Evaluation"]
        R1["mail-attachment.rule.ts"]
        R2["Condition Check:\nhas_attachments > 0?"]
        R3["Action Proposal\nGeneration"]
    end

    subgraph Candidate["Recommendation Candidate"]
        C1["candidate_id: uuid"]
        C2["title: 'Anhaenge speichern'"]
        C3["class: cleanup"]
        C4["score: 0.8"]
        C5["action_proposal:\n  steps: [copy_file x2]"]
        C6["push_title:\n'2 Anhaenge speichern'"]
    end

    subgraph Dedup["Deduplication"]
        D1["Generate content hash\nSHA-256(rule+object+user)"]
        D2["Check Redis:\nexists(dedup_key)?"]
        D3["Store if new\nTTL: 30 days"]
    end

    subgraph Storage["Dual Storage"]
        S1[("Redis\nFast Access\n24h TTL")]
        S2[("MongoDB\nPersistent\nMetrics")]
    end

    E1 & E2 & E3 & E4 --> R1
    R1 --> R2
    R2 -->|"Yes"| R3
    R2 -->|"No"| Skip["Skip: No action"]
    R3 --> C1 & C2 & C3 & C4 & C5 & C6
    C1 & C2 & C3 & C4 & C5 & C6 --> D1
    D1 --> D2
    D2 -->|"New"| D3
    D2 -->|"Exists"| Dup["Skip: Duplicate"]
    D3 --> S1 & S2
```

---

## 3. Beispiel: E-Mail mit Anhängen

**Kapitel:** 5. Anwendungsbeispiele

**Szenario:**
- Lehrer erhält E-Mail "Unterrichtsmaterial Mathe" mit 2 PDF-Anhängen
- System generiert Empfehlung zum Speichern der Anhänge
- Push-Benachrichtigung: "2 Anhänge speichern"

```mermaid
sequenceDiagram
    autonumber
    participant User as Lehrer
    participant Mail as SOGo Mail
    participant API as Events API
    participant Rule as Mail Rule
    participant Reco as Recommendations
    participant Plan as Daily Plan
    participant Push as Push Service

    Note over Mail: Lehrer erhaelt E-Mail<br/>Betreff: "Unterrichtsmaterial Mathe"<br/>Anhaenge: Arbeitsblatt.pdf, Loesungen.docx

    Mail->>API: POST /events/ingest
    Note right of API: {<br/>  type: "mail.received",<br/>  source: "mail",<br/>  metadata: {<br/>    subject: "Unterrichtsmaterial",<br/>    attachment_count: 2<br/>  },<br/>  payload: {<br/>    attachments: [<br/>      {filename: "Arbeitsblatt.pdf"},<br/>      {filename: "Loesungen.docx"}<br/>    ]<br/>  }<br/>}

    API->>Rule: Event an Rule Engine
    activate Rule

    Rule->>Rule: Pruefe: attachment_count > 0?
    Note right of Rule: Bedingung erfuellt

    Rule->>Rule: Generiere ActionProposal
    Note right of Rule: Steps:<br/>1. files.copy_file → Arbeitsblatt.pdf<br/>2. files.copy_file → Loesungen.docx<br/>Ziel: /Unterricht/Mathe/

    Rule->>Reco: Speichere Empfehlung
    deactivate Rule
    Note right of Reco: {<br/>  candidate_id: "cand-123",<br/>  title: "E-Mail-Anhaenge speichern",<br/>  class: "cleanup",<br/>  score: 0.8,<br/>  push_title: "2 Anhaenge speichern",<br/>  push_content: "Speichere Anhaenge aus...",<br/>  action_proposal: {...}<br/>}

    Note over Plan: Morgens 8:00 (PROD)<br/>oder sofort (DEV)

    Reco->>Plan: Hole Empfehlungen fuer Nutzer
    Plan->>Plan: LLM generiert Tagesplan
    Plan->>Push: Sende Benachrichtigung

    Push->>User: Push: "2 Anhaenge speichern"<br/>"Speichere Anhaenge aus 'Unterrichtsmaterial'..."

    Note over User: Nutzer oeffnet App
    User->>Plan: Klickt "Ausfuehren"
    Plan->>Reco: Execute action_proposal
    Reco-->>User: Erfolgsmeldung
```

---

## 4. Beispiel: Konferenz-Workspace

**Kapitel:** 5. Anwendungsbeispiele

**Szenario:**
- Lehrer erstellt Konferenz "Mathematik 10b"
- System schlägt vor: Ordner + Gruppenchat erstellen
- Nutzer führt Aktionen via MCP Tools aus

```mermaid
sequenceDiagram
    autonumber
    participant Teacher as Lehrer
    participant BBB as BigBlueButton
    participant API as Events API
    participant Rule as Conference Rule
    participant Reco as Recommendations
    participant MCP as MCP Server
    participant Files as Dateiserver
    participant Chat as Rocket.Chat

    Note over BBB: Lehrer erstellt Konferenz<br/>Fach: "Mathematik 10b"<br/>Teilnehmer: 25 Schueler

    BBB->>API: POST /events/ingest
    Note right of API: {<br/>  type: "conference.created",<br/>  source: "conferences",<br/>  metadata: {<br/>    conference_id: "conf-456",<br/>    subject_name: "Mathematik",<br/>    participant_count: 25<br/>  },<br/>  payload: {<br/>    participants: ["schueler1", ...]<br/>  }<br/>}

    API->>Rule: Event an Rule Engine
    activate Rule

    Rule->>Rule: Generiere Workspace-Setup
    Note right of Rule: ActionProposal:<br/>Step 1: files.create_folder<br/>  → /Kurse/Mathematik_2025<br/>Step 2: chat.create_group<br/>  → "Mathematik - Diskussion"

    Rule->>Reco: Speichere Empfehlung
    deactivate Rule
    Note right of Reco: {<br/>  title: "Workspace einrichten",<br/>  class: "organization",<br/>  push_title: "Konferenz vorbereiten",<br/>  action_proposal: {<br/>    proposal_id: "prop-789",<br/>    requires_approval: true,<br/>    reversible: "full",<br/>    risk: "low"<br/>  }<br/>}

    Note over Teacher: Nutzer sieht Empfehlung im Daily Plan

    Teacher->>Reco: Klickt "Ausfuehren" Button
    activate MCP

    Reco->>MCP: Execute Step 1: files.create_folder
    MCP->>Files: WebDAV MKCOL /Kurse/Mathematik_2025
    Files-->>MCP: 201 Created
    MCP-->>Reco: Step 1 Success

    Reco->>MCP: Execute Step 2: chat.create_group
    MCP->>Chat: POST /api/v1/groups.create
    Chat-->>MCP: Group created
    MCP-->>Reco: Step 2 Success

    deactivate MCP
    Reco-->>Teacher: Alle Schritte erfolgreich

    Note over Teacher: Workspace bereit:<br/>- Ordner fuer Materialien<br/>- Gruppenchat fuer Diskussion
```

---

## 5. Multi-Source Aggregation

**Kapitel:** 4.3 Cross-App Aggregation

**Beschreibung:** Demonstriert Cross-App Aggregation aus mehreren Eventquellen.

**Kernpunkte:**
- 4 Events aus verschiedenen Quellen an einem Vormittag
- Jedes Event generiert einen Recommendation Candidate
- Aggregation sortiert nach Klassen-Priorität (nicht Score!)
- Ablation Study Finding: Klassen-Priorität > Score

```mermaid
flowchart TB
    subgraph Morning["Vormittag: Events 8:00-12:00"]
        E1["08:15 mail.received\n'Elternbrief' + 2 Anhaenge\nSource: SOGo"]
        E2["09:30 conference.created\n'Mathematik 10b'\nSource: BBB"]
        E3["10:00 calendar.event_upcoming\nBesprechung in 2h\nSource: CalDAV"]
        E4["11:15 chat.mention\nDringende Frage\nSource: Rocket.Chat"]
    end

    subgraph Rules["Rule Processing"]
        R1["mail-attachment.rule\nScore: 0.75\nClass: cleanup"]
        R2["conference-workspace.rule\nScore: 0.85\nClass: organization"]
        R3["meeting-prep.rule\nScore: 0.90\nClass: preparation"]
        R4["chat-response.rule\nScore: 0.80\nClass: communication"]
    end

    subgraph Candidates["Generierte Kandidaten"]
        C1["Kandidat 1\nAnhaenge speichern\ncleanup | 0.75"]
        C2["Kandidat 2\nWorkspace einrichten\norganization | 0.85"]
        C3["Kandidat 3\nBesprechung vorbereiten\npreparation | 0.90"]
        C4["Kandidat 4\nChat beantworten\ncommunication | 0.80"]
    end

    subgraph Ranking["Aggregation & Ranking"]
        Agg["Sortierung nach:\n1. Klassen-Prioritaet\n2. Score\n3. Zeitliche Dringlichkeit"]
        Priority["Klassen-Reihenfolge:\n1. preparation\n2. communication\n3. organization\n4. cleanup"]
    end

    subgraph Plan["Finaler Daily Plan"]
        P1["Prioritaet 1\nBesprechung vorbereiten\nZeitkritisch!"]
        P2["Prioritaet 2\nChat beantworten\nSoziale Interaktion"]
        P3["Prioritaet 3\nWorkspace einrichten\nOrganisation"]
        P4["Prioritaet 4\nAnhaenge speichern\nAufraeum-Aufgabe"]
    end

    E1 --> R1 --> C1
    E2 --> R2 --> C2
    E3 --> R3 --> C3
    E4 --> R4 --> C4

    C1 & C2 & C3 & C4 --> Agg
    Agg --> Priority
    Priority --> P1 & P2 & P3 & P4
```

---

## 6. Timeline: DEV-Modus

**Kapitel:** 4.4 Betriebsmodi

**Beschreibung:** Zeigt die sofortige Verarbeitung im Entwicklungsmodus.

**Charakteristiken:**
- Events werden sofort verarbeitet
- Keine Batching- oder Scheduling-Verzögerungen
- UI aktualisiert sich innerhalb von Sekunden

```mermaid
gantt
    title DEV-Modus: Sofortige Verarbeitung
    dateFormat HH:mm
    axisFormat %H:%M

    section Events
    Demo-Daten generiert    :e1, 09:00, 1m
    Events aufgenommen      :e2, after e1, 1m

    section Verarbeitung
    Rules ausgewertet       :p1, after e2, 1m
    Empfehlungen gespeichert:p2, after p1, 1m
    Cache invalidiert       :p3, after p2, 1m

    section Ausgabe
    Plan neu generiert      :crit, o1, after p3, 2m
    UI zeigt neue Daten     :o2, after o1, 1m

    section Nutzer
    Sieht Aenderungen       :u1, after o2, 1m
```

---

## 7. Timeline: PROD-Modus

**Kapitel:** 4.4 Betriebsmodi

**Beschreibung:** Zeigt die Batch-Verarbeitung im Produktionsmodus.

**Charakteristiken:**
- Events sammeln sich über den Tag
- Cron-Job um 8:00 Uhr (Europe/Berlin)
- Pläne werden frisch generiert, Push an alle Nutzer

```mermaid
gantt
    title PROD-Modus: Batch-Verarbeitung
    dateFormat HH:mm
    axisFormat %H:%M

    section Vortag
    Events treffen ein      :e1, 14:00, 6h
    Empfehlungen gesammelt  :e2, 14:00, 6h

    section Nacht
    Events laufen weiter    :n1, 20:00, 10h
    Keine Planverarbeitung  :n2, 20:00, 10h

    section Morgen
    Cron-Job 8:00 Uhr       :crit, m1, 08:00, 1m
    Cache invalidiert       :m2, after m1, 1m
    Plaene generiert        :crit, m3, after m2, 5m
    Push gesendet           :m4, after m3, 2m

    section Nutzer
    Push empfangen          :u1, after m4, 1m
    App geoeffnet           :u2, after u1, 5m
    Tagesplan angezeigt     :u3, after u2, 1m
```

---

## 8. DEV vs PROD Vergleich

**Kapitel:** 4.4 Betriebsmodi

**Beschreibung:** Direkter Vergleich der beiden Betriebsmodi.

```mermaid
flowchart TB
    subgraph DEV["DEV-Modus"]
        direction TB
        D1["Event trifft ein"]
        D2["Sofortige Verarbeitung\n~30 Sekunden Intervall"]
        D3["Cache-Check alle 30s"]
        D4["Push bei Aenderung\nDebounce: 5 Minuten"]
        D5["UI aktualisiert sofort"]

        D1 --> D2 --> D3 --> D4 --> D5
    end

    subgraph PROD["PROD-Modus"]
        direction TB
        P1["Events sammeln\nden ganzen Tag"]
        P2["Cron-Job 8:00 Uhr\nEurope/Berlin"]
        P3["Alle Caches invalidieren"]
        P4["Plaene fuer alle Nutzer\ngenerieren"]
        P5["Push-Benachrichtigungen\nversenden"]

        P1 --> P2 --> P3 --> P4 --> P5
    end

    subgraph Comparison["Vergleich"]
        direction LR
        C1["Latenz"]
        C2["Cache-Hit-Rate"]
        C3["LLM-Aufrufe"]
        C4["Push-Frequenz"]
    end

    DEV ~~~ PROD

    subgraph Metrics["Metriken"]
        M1["DEV: ~5s | PROD: ~5s\nBei Cache-Miss"]
        M2["DEV: 60-70% | PROD: 80-90%\nHoeher durch Batch"]
        M3["DEV: Haeufig | PROD: 1x taeglich\nKostenoptimiert"]
        M4["DEV: Bei Aenderung | PROD: 8:00 Uhr\nVorhersehbar"]
    end

    C1 --- M1
    C2 --- M2
    C3 --- M3
    C4 --- M4
```

---

## 9. Klassen-Priorität (Ablation)

**Kapitel:** 6. Evaluation

**Beschreibung:** Visualisiert das zentrale Ablation Study Finding: Klassen-Priorität übertrifft Score-basierte Sortierung.

**Kernaussage:**
- Trotz höchstem Score (0.90) landet "cleanup" auf dem letzten Platz
- "preparation" (Score 0.70) wird zur höchsten Priorität
- Diese Ordnung verbessert die Nutzerzufriedenheit und Aufgabenrelevanz

```mermaid
flowchart TB
    subgraph Input["Eingabe: Unsortierte Kandidaten"]
        I1["cleanup\nScore: 0.90\nHoechster Score!"]
        I2["preparation\nScore: 0.70\nNiedrigster Score"]
        I3["organization\nScore: 0.80"]
        I4["communication\nScore: 0.85"]
    end

    subgraph ScoreSort["Variante A: Nur Score-Sortierung"]
        S1["#1 cleanup (0.90)"]
        S2["#2 communication (0.85)"]
        S3["#3 organization (0.80)"]
        S4["#4 preparation (0.70)"]
        SResult["Precision@3: 25%\nZeitkritisches zuletzt!"]
    end

    subgraph ClassSort["Variante B: Klassen-Prioritaet"]
        C1["#1 preparation (0.70)\nZeitkritisch!"]
        C2["#2 communication (0.85)\nSozial wichtig"]
        C3["#3 organization (0.80)\nStruktur"]
        C4["#4 cleanup (0.90)\nWarten kann"]
        CResult["Precision@3: 67%\nRelevantes zuerst!"]
    end

    subgraph Priority["Klassen-Hierarchie"]
        P1["1. preparation\nZeitgebunden"]
        P2["2. communication\nSoziale Pflicht"]
        P3["3. organization\nStrukturaufbau"]
        P4["4. cleanup\nKann warten"]
    end

    subgraph Finding["Ablation Study Ergebnis"]
        F1["Klassen-Prioritaet\nuebertrifft Score!"]
        F2["Static > Score-based\nin allen Szenarien"]
        F3["Besonders bei\nzeitkritischen Events"]
    end

    Input --> ScoreSort
    Input --> ClassSort
    Priority --> ClassSort

    ScoreSort --> SResult
    ClassSort --> CResult

    CResult --> Finding
```

---

## 10. Action Execution Flow

**Kapitel:** 4.5 Agentische Aktionen

**Beschreibung:** Zeigt die Zustandsmaschine für Action Proposal Execution.

**Zustände:**
- **Pending:** Empfehlung erstellt, wartet auf Nutzer
- **Reviewing:** Nutzer sieht im Daily Plan
- **Executing:** Nutzer hat Play geklickt, Schritte laufen
- **Completed:** Alle Schritte erfolgreich
- **Failed:** Ein oder mehr Schritte fehlgeschlagen (Retry verfügbar)
- **Dismissed:** Nutzer hat Empfehlung verworfen

```mermaid
stateDiagram-v2
    [*] --> Pending: Empfehlung erstellt

    state Pending {
        [*] --> Waiting
        Waiting: Wartet auf Nutzer
        Waiting: TTL: 24 Stunden
    }

    Pending --> Reviewing: Nutzer sieht im Daily Plan

    state Reviewing {
        [*] --> Displayed
        Displayed: Angezeigt mit Play-Button
        Displayed: ActionProposal sichtbar
    }

    Reviewing --> Executing: Nutzer klickt Play
    Reviewing --> Dismissed: Nutzer verwirft

    state Executing {
        [*] --> Step1
        Step1: Schritt 1 ausfuehren
        Step1 --> Step2: Erfolg
        Step1 --> StepFailed: Fehler
        Step2: Schritt 2 ausfuehren
        Step2 --> StepN: Erfolg
        Step2 --> StepFailed: Fehler
        StepN: Weitere Schritte...
        StepN --> AllDone: Alle fertig
        StepN --> StepFailed: Fehler

        state StepFailed {
            [*] --> CheckOptional
            CheckOptional: Ist Schritt optional?
            CheckOptional --> ContinueNext: Ja
            CheckOptional --> AbortAll: Nein
        }
    }

    Executing --> Completed: AllDone
    Executing --> Failed: AbortAll

    state Completed {
        [*] --> Success
        Success: executed: true
        Success: Metriken erfasst
    }

    state Failed {
        [*] --> Error
        Error: Fehlerdetails gespeichert
        Error: Retry moeglich
    }

    state Dismissed {
        [*] --> Discarded
        Discarded: dismissed: true
        Discarded: Kein Retry
    }

    Completed --> [*]: Abgeschlossen
    Failed --> Pending: Retry verfuegbar
    Dismissed --> [*]: Verworfen
```

---

## 11. Cache-Strategie

**Kapitel:** 4.6 Performance

**Beschreibung:** Illustriert das Multi-Layer Caching für Daily Plan Generation.

**Latenz-Vergleich:**

| Quelle | Latenz | Anteil |
|--------|--------|--------|
| Redis | ~5ms | 70% |
| MongoDB | ~20ms | 20% |
| LLM Generation | ~5000ms | 10% |

**Cache Invalidation:**
- Input Hash berechnet aus Summary + Recommendations
- Jede Änderung der Inputs triggert Cache Miss
- Fresh Generation wird in beide Layer gespeichert

```mermaid
flowchart TB
    subgraph Request["Anfrage"]
        Req["GET /ai/daily-plan/:userId/:date"]
    end

    subgraph Hash["Input-Hash Berechnung"]
        H1["Sammle Inputs:\n- Empfehlungen\n- Zusammenfassung\n- Spracheinstellung"]
        H2["Normalisiere\nund sortiere"]
        H3["SHA-256 Hash\nberechnen"]
    end

    subgraph Redis["Layer 1: Redis"]
        R1[("Redis Cache\nTTL: 7 Tage")]
        R2{"Hash\nvorhanden?"}
        R3["Treffer!\n~5ms"]
    end

    subgraph Mongo["Layer 2: MongoDB"]
        M1[("MongoDB\nPersistent")]
        M2{"Dokument\nvorhanden?"}
        M3["Treffer!\n~20ms"]
        M4["cache_hits++"]
    end

    subgraph LLM["Layer 3: LLM Generation"]
        L1["AI Service\naufrufen"]
        L2["Plan generieren\n~5000ms"]
        L3["Validierung\n+ Guardrails"]
        L4["Fallback bei\nFehler"]
    end

    subgraph Store["Speicherung"]
        S1["In Redis\nspeichern"]
        S2["In MongoDB\npersistieren"]
        S3["Metriken\nerfassen"]
    end

    subgraph Response["Antwort"]
        Fast["Schnelle Antwort\nCached: < 50ms"]
        Slow["Langsame Antwort\nFresh: ~5000ms"]
    end

    Req --> H1 --> H2 --> H3
    H3 --> R2
    R2 -->|"Ja"| R3 --> Fast
    R2 -->|"Nein"| M2
    M2 -->|"Ja"| M3 --> M4 --> S1 --> Fast
    M2 -->|"Nein"| L1
    L1 --> L2 --> L3
    L3 -->|"Erfolg"| S1 & S2 & S3 --> Slow
    L3 -->|"Fehler"| L4 --> S1 & S2 --> Slow
```

---

## Verwendung in der Thesis

### Kapitel-Zuordnung

| Diagramm | Thesis-Kapitel |
|----------|----------------|
| 01 Systemarchitektur | 3. Systemarchitektur |
| 02 Event-zu-Empfehlung | 4. Implementierung |
| 03-04 Konkrete Beispiele | 5. Anwendungsbeispiele |
| 05 Multi-Source Aggregation | 4.3 Cross-App Aggregation |
| 06-08 Timeline-Diagramme | 4.4 Betriebsmodi |
| 09 Klassen-Priorität | 6. Evaluation (Ablation) |
| 10 Action Execution | 4.5 Agentische Aktionen |
| 11 Cache-Strategie | 4.6 Performance |

### Rendering-Hinweise

Diese Diagramme sind in Mermaid-Syntax geschrieben und können gerendert werden:

1. **LaTeX:** Mit `mermaid-cli` zu PDF/PNG exportieren
2. **Markdown:** GitHub/GitLab rendern nativ
3. **Web:** Mit Mermaid.js Library
4. **VS Code:** Mit Mermaid Preview Extension

### Export-Befehl

```bash
# mermaid-cli installieren
npm install -g @mermaid-js/mermaid-cli

# Alle Diagramme zu PNG exportieren
find docs/thesis/diagrams -name "*.mermaid" -exec sh -c \
  'mmdc -i "$1" -o "${1%.mermaid}.png" -t neutral -b white' _ {} \;
```

### LaTeX-Einbindung

```latex
\begin{figure}[h]
  \centering
  \includegraphics[width=\textwidth]{diagrams/architecture/01-system-overview.png}
  \caption{Systemarchitektur der Cross-App Intelligence}
  \label{fig:system-overview}
\end{figure}
```

---

## Dateien

Alle Diagramme sind auch als separate Dateien verfügbar:

```
docs/thesis/diagrams/
├── README.md
├── THESIS_DIAGRAMS.md
├── COMPLETE_DOCUMENTATION.md         # Vollständige technische Dokumentation
├── architecture/
│   ├── 01-system-overview.mermaid
│   └── 02-event-to-recommendation.mermaid
├── examples/
│   ├── 03-mail-attachments.mermaid
│   ├── 04-conference-workspace.mermaid
│   └── 05-multi-source-aggregation.mermaid
├── timelines/
│   ├── 06-dev-mode-timeline.mermaid
│   ├── 07-prod-mode-timeline.mermaid
│   └── 08-dev-vs-prod-comparison.mermaid
├── analysis/
│   ├── 09-class-priority-ablation.mermaid
│   ├── 10-action-execution-flow.mermaid
│   ├── 11-cache-strategy.mermaid
│   ├── 12-complete-event-taxonomy.mermaid   # NEU: Alle 46 Event Types
│   ├── 13-all-rules-overview.mermaid        # NEU: Alle 21 Rules
│   ├── 14-dedup-algorithm.mermaid           # NEU: Deduplizierungs-Algorithmus
│   ├── 15-scoring-algorithm.mermaid         # NEU: Scoring-Formel
│   ├── 16-precision-calculation.mermaid     # NEU: Precision@3 Berechnung
│   └── 17-cross-source-gain.mermaid         # NEU: Cross-Source Gain Rate
└── THESIS_DIAGRAMS.md
```

---

*Dokument generiert: 2025-12-21*
*Thesis: "Cross-App-Intelligenz in Echtzeit: Systementwurf und empirische Evidenz für agentische Personalisierung"*
