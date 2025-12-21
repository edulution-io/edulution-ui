/*
 * LICENSE PLACEHOLDER
 */

import type { DailySummary, RecommendationOutboxItem } from '@edulution/events';

type SupportedLanguage = 'de' | 'en' | 'fr';

const LANGUAGE_INSTRUCTIONS: Record<SupportedLanguage, string> = {
  de: 'WICHTIG: Alle Textfelder (plan_title, title, why, focus, items, recap, notes) MÜSSEN auf Deutsch verfasst sein.',
  en: 'IMPORTANT: All text fields (plan_title, title, why, focus, items, recap, notes) MUST be written in English.',
  fr: 'IMPORTANT: Tous les champs de texte (plan_title, title, why, focus, items, recap, notes) DOIVENT être rédigés en français.',
};

const LANGUAGE_EXAMPLES: Record<SupportedLanguage, { plan_title: string; priority_title: string; why: string; focus: string }> = {
  de: {
    plan_title: 'Deine Prioritäten für heute',
    priority_title: 'Ausstehende Kommunikation prüfen',
    why: 'Basierend auf E-Mail-Aktivitäten warten Gespräche auf Ihre Antwort.',
    focus: 'Kommunikation',
  },
  en: {
    plan_title: 'Your priorities for today',
    priority_title: 'Review pending communications',
    why: 'Based on mail activity, conversations are awaiting your response.',
    focus: 'Communications',
  },
  fr: {
    plan_title: 'Vos priorités pour aujourd\'hui',
    priority_title: 'Examiner les communications en attente',
    why: 'Sur la base de l\'activité de messagerie, des conversations attendent votre réponse.',
    focus: 'Communications',
  },
};

function normalizeLanguage(lang?: string): SupportedLanguage {
  if (!lang) return 'de';
  const normalized = lang.toLowerCase().slice(0, 2);
  if (normalized === 'en') return 'en';
  if (normalized === 'fr') return 'fr';
  return 'de';
}

interface SanitizedSummary {
  user_id: string;
  date: string;
  activity_level: string;
  by_source?: Array<{
    source: string;
    activity_level: string;
  }>;
  communications?: {
    has_active_threads: boolean;
    has_awaiting_reply: boolean;
  };
  meetings?: {
    has_upcoming: boolean;
    is_busy_day: boolean;
  };
}

interface SanitizedRecommendation {
  candidate_id: string;
  class: string;
  title: string;
  rationale: string;
  sources_involved: string[];
  evidence_summary: string;
}

function getActivityLevel(eventCount: number): string {
  if (eventCount > 20) return 'high';
  if (eventCount > 5) return 'medium';
  return 'low';
}

function sanitizeSummary(summary: DailySummary): SanitizedSummary {
  return {
    user_id: summary.user_id,
    date: summary.date,
    activity_level: summary.activity_level,
    by_source: summary.by_source?.map((s) => ({
      source: s.source,
      activity_level: getActivityLevel(s.event_count),
    })),
    communications: summary.communications
      ? {
          has_active_threads: summary.communications.threads_active > 0,
          has_awaiting_reply: summary.communications.threads_awaiting_reply > 0,
        }
      : undefined,
    meetings: summary.meetings
      ? {
          has_upcoming: summary.meetings.upcoming_24h > 0,
          is_busy_day: summary.meetings.total_scheduled > 3,
        }
      : undefined,
  };
}

function sanitizeRecommendations(recommendations: RecommendationOutboxItem[]): SanitizedRecommendation[] {
  return recommendations.map((r) => ({
    candidate_id: r.candidate_id,
    class: r.class,
    title: r.title,
    rationale: r.rationale,
    sources_involved: r.sources_involved || [],
    evidence_summary: r.evidence?.map((e) => e.kind).join(', ') || 'none',
  }));
}

interface BuildPromptOptions {
  language?: string;
}

function buildDailyPlanPrompt(
  summary: DailySummary,
  recommendations: RecommendationOutboxItem[],
  options: BuildPromptOptions = {},
): string {
  const sanitizedSummary = sanitizeSummary(summary);
  const sanitizedRecommendations = sanitizeRecommendations(recommendations);
  const lang = normalizeLanguage(options.language);
  const langInstruction = LANGUAGE_INSTRUCTIONS[lang];
  const langExample = LANGUAGE_EXAMPLES[lang];

  return `You are a helpful assistant creating a personalized daily plan.

## LANGUAGE REQUIREMENT
${langInstruction}

## CRITICAL RULES - MUST FOLLOW:

### Rule A: Source of Truth
You MUST only use facts present in the provided JSON inputs.
You MUST NOT add any new facts, numbers, times, meeting counts, thread counts, or inferred content.

### Rule B: No Numerals
Do NOT use any numerals (digits zero through nine) anywhere in text fields of your response.
Use words like "several", "a few", "many", "later today", "this afternoon" instead.
EXCEPTION: The "rank" field MUST be a numeric integer - this is required for sorting.

### Rule C: Priority Limits (CRITICAL)
You MUST generate between 3 and 5 priorities (MAXIMUM 6, NEVER MORE).
- Each priority has a "rank" field with values 1 through 6 (never higher than 6)
- Focus on the most important recommendations, do not include everything
- If there are many recommendations, consolidate similar ones into a single priority

### Rule D: Candidate Linking (CRITICAL)
The recommendations array contains objects with: candidate_id, class, title, rationale, sources_involved, evidence_summary.

CRITICAL RULES:
- Every priority item MUST include linked_candidate_ids with one or more candidate_id values from the recommendations.
- You MUST copy the exact candidate_id strings - do NOT invent IDs.
- If recommendations array is empty, priorities array should have exactly one item with linked_candidate_ids: [].
- Base your priority titles and "why" text on the recommendation's title and rationale.

### Rule E: No Absolute Unsupported Claims
FORBIDDEN phrases (do not use):
- "no meetings" / "no meeting scheduled"
- "high activity" / "medium activity" / "low activity" (unless summary.activity_level exists)

If uncertain about meetings, use conditional language: "If you have meetings later today..."

### Rule F: Strict JSON Output
Output ONLY valid JSON matching the schema. No markdown code blocks. No commentary before or after.

### Rule G: Evidence-Based Wording
For each priority's "why" field:
- Paraphrase the recommendation's rationale
- Do NOT invent details
- If mentioning a source (mail/chat/caldav/files), it must appear in summary.by_source

### Rule H: Schedule Must Reference Priorities
- schedule_suggestion.items MUST only contain text derived from priorities
- Each item should correspond to a priority title or be a direct paraphrase
- Do NOT add new tasks in schedule_suggestion that aren't in priorities
- If you have priorities, your schedule items across all time windows should reference those same priorities
- The "focus" field MUST be SPECIFIC to the actual tasks, NOT generic!

FORBIDDEN focus values (too generic):
- "Continued work" / "Weiterführende Arbeit"
- "Additional tasks" / "Zusätzliche Aufgaben"
- "General work" / "Allgemeine Arbeit"

GOOD focus values (specific):
- "E-Mail-Anhänge organisieren"
- "Projekteinrichtung"
- "Kommunikation bearbeiten"
- "Meeting-Vorbereitung"

Example:
  - priorities: ["Prepare for meeting", "Review communications", "Focus on deep work"]
  - morning: { focus: "Meeting preparation and communications", items: ["Prepare for meeting", "Review communications"] }
  - midday: { focus: "Deep focus work", items: ["Focus on deep work"] }
  - NOT ALLOWED: { focus: "Continued work", items: [...] }

### Rule I: No Absolute Time Claims
FORBIDDEN time words:
- "soon" / "shortly" / "right now" / "immediately" / "starting now"

ALLOWED alternatives:
- "later today"
- "upcoming"
- "when ready"
- "at a suitable time"

Examples:
- BAD: "Meeting starts soon."
- GOOD: "An upcoming meeting may require preparation."
- BAD: "Respond to emails soon."
- GOOD: "Communications are awaiting your response."

### Rule J: Evidence-Based "why" Text
The "why" field for each priority MUST:
- Paraphrase the recommendation's rationale (provided in input)
- Reference the evidence kind when appropriate
- NOT make claims beyond what the evidence supports

Templates for "why" based on evidence_summary:
- state evidence: "Based on [source] activity, [paraphrased rationale]."
- event evidence: "A [source] event indicates [paraphrased rationale]."
- correlation evidence: "Cross-source analysis suggests [paraphrased rationale]."
- heuristic evidence: "Activity patterns indicate [paraphrased rationale]."

Examples:
- Input rationale: "Meeting scheduled for today"
  Input evidence_summary: "event"
  BAD why: "Meeting starts soon."
  GOOD why: "Calendar shows an upcoming event that may need preparation."

- Input rationale: "Unread messages awaiting reply"
  Input evidence_summary: "state"
  BAD why: "You have emails to answer."
  GOOD why: "Mail activity indicates conversations awaiting your response."

## INPUT: Daily Summary
${JSON.stringify(sanitizedSummary, null, 2)}

## INPUT: Recommendations (prioritized)
${JSON.stringify(sanitizedRecommendations, null, 2)}

## OUTPUT SCHEMA (follow exactly):
{
  "user_id": "string - copy from input summary",
  "date": "YYYY-MM-DD - copy from input summary",
  "plan_title": "Short title for the day (no numerals in text)",
  "priorities": [  // ARRAY OF 3-5 ITEMS (MAX 6!)
    {
      "rank": 1,  // Integer 1-6, never higher!
      "title": "Short priority title based on recommendation",
      "why": "Brief explanation paraphrasing recommendation rationale",
      "linked_candidate_ids": ["candidate-id-from-recommendations"]
    }
  ],
  "schedule_suggestion": [
    {
      "time_window": "morning|midday|afternoon|evening",
      "focus": "What to focus on",
      "items": ["Action item (no numerals)"]
    }
  ],
  "recap": "Brief paragraph summarizing the plan",
  "notes": ["Optional helpful notes"],
  "safety": {
    "no_new_facts": true,
    "numerals_allowed": false,
    "checked": true
  },
  "generated_at": "SET_BY_SERVICE"
}

## EXAMPLE OUTPUT (for reference, using ${lang.toUpperCase()} language):
{
  "user_id": "example-user",
  "date": "YYYY-MM-DD",
  "plan_title": "${langExample.plan_title}",
  "priorities": [
    {
      "rank": 1,
      "title": "${langExample.priority_title}",
      "why": "${langExample.why}",
      "linked_candidate_ids": ["rec-abc-123"]
    }
  ],
  "schedule_suggestion": [
    {
      "time_window": "morning",
      "focus": "${langExample.focus}",
      "items": ["${langExample.priority_title}"]
    }
  ],
  "recap": "...",
  "notes": [],
  "safety": {
    "no_new_facts": true,
    "numerals_allowed": false,
    "checked": true
  },
  "generated_at": "SET_BY_SERVICE"
}

Generate the daily plan JSON now. Remember: NO NUMERALS in text, NO INVENTED FACTS, MUST link candidate_ids, OUTPUT IN ${lang.toUpperCase()}.`;
}

export { buildDailyPlanPrompt, sanitizeSummary, sanitizeRecommendations, normalizeLanguage };
export type { SanitizedSummary, SanitizedRecommendation, BuildPromptOptions, SupportedLanguage };
