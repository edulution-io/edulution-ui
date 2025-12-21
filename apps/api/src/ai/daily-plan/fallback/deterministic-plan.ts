/*
 * LICENSE PLACEHOLDER
 */

import type { RecommendationOutboxItem } from '@edulution/events';
import type { AiDailyPlan, ScheduleItem, PriorityItem } from '../schemas/daily-plan.schema';

type SupportedLanguage = 'de' | 'en' | 'fr';

interface LanguageStrings {
  planTitle: string;
  reviewYourDay: string;
  noRecommendations: string;
  planYourDay: string;
  reviewPriorities: string;
  priorityTasks: string;
  continuedWork: string;
  additionalTasks: string;
  todaysPriorities: string;
  focusOn: string;
  basedOn: string;
  activity: string;
  and: string;
  yourKeyFocusAreas: string;
  reviewSchedule: string;
  basedOnActivity: string;
  currentState: string;
  upcomingEvent: string;
  eventIndicates: string;
  crossSourceAnalysis: string;
  activityPatterns: string;
}

const STRINGS: Record<SupportedLanguage, LanguageStrings> = {
  de: {
    planTitle: 'Deine Prioritäten für heute',
    reviewYourDay: 'Überprüfe deinen Tag',
    noRecommendations: 'Keine spezifischen Empfehlungen verfügbar.',
    planYourDay: 'Plane deinen Tag',
    reviewPriorities: 'Prioritäten überprüfen',
    priorityTasks: 'Prioritätsaufgaben',
    continuedWork: 'Weiterführende Arbeit',
    additionalTasks: 'Zusätzliche Aufgaben',
    todaysPriorities: 'Heutige Prioritäten',
    focusOn: 'Fokus auf',
    basedOn: 'Basierend auf',
    activity: 'Aktivität',
    and: 'und',
    yourKeyFocusAreas: 'deine wichtigsten Schwerpunkte sind',
    reviewSchedule: 'Überprüfe deinen Zeitplan und plane entsprechend.',
    basedOnActivity: 'Basierend auf Aktivität',
    currentState: 'Basierend auf aktuellem Stand',
    upcomingEvent: 'Ein bevorstehendes Ereignis zeigt an',
    eventIndicates: 'Ein Ereignis zeigt an',
    crossSourceAnalysis: 'Quellenübergreifende Analyse deutet auf',
    activityPatterns: 'Aktivitätsmuster deuten auf',
  },
  en: {
    planTitle: 'Your priorities for today',
    reviewYourDay: 'Review your day',
    noRecommendations: 'No specific recommendations available.',
    planYourDay: 'Plan your day',
    reviewPriorities: 'Review priorities',
    priorityTasks: 'Priority tasks',
    continuedWork: 'Continued work',
    additionalTasks: 'Additional tasks',
    todaysPriorities: "Today's priorities",
    focusOn: 'Focus on',
    basedOn: 'Based on',
    activity: 'activity',
    and: 'and',
    yourKeyFocusAreas: 'your key focus areas are',
    reviewSchedule: 'Review your schedule and plan accordingly.',
    basedOnActivity: 'Based on activity',
    currentState: 'Based on current state',
    upcomingEvent: 'An upcoming event indicates',
    eventIndicates: 'An event indicates',
    crossSourceAnalysis: 'Cross-source analysis suggests',
    activityPatterns: 'Activity patterns indicate',
  },
  fr: {
    planTitle: 'Vos priorités pour aujourd\'hui',
    reviewYourDay: 'Examinez votre journée',
    noRecommendations: 'Aucune recommandation spécifique disponible.',
    planYourDay: 'Planifiez votre journée',
    reviewPriorities: 'Examiner les priorités',
    priorityTasks: 'Tâches prioritaires',
    continuedWork: 'Travail continu',
    additionalTasks: 'Tâches supplémentaires',
    todaysPriorities: 'Les priorités du jour',
    focusOn: 'Se concentrer sur',
    basedOn: 'Basé sur',
    activity: 'activité',
    and: 'et',
    yourKeyFocusAreas: 'vos principaux domaines de concentration sont',
    reviewSchedule: 'Examinez votre emploi du temps et planifiez en conséquence.',
    basedOnActivity: 'Basé sur l\'activité',
    currentState: 'Basé sur l\'état actuel',
    upcomingEvent: 'Un événement à venir indique',
    eventIndicates: 'Un événement indique',
    crossSourceAnalysis: 'L\'analyse croisée des sources suggère',
    activityPatterns: 'Les modèles d\'activité indiquent',
  },
};

function normalizeLanguage(lang?: string): SupportedLanguage {
  if (!lang) return 'de';
  const normalized = lang.toLowerCase().slice(0, 2);
  if (normalized === 'en') return 'en';
  if (normalized === 'fr') return 'fr';
  return 'de';
}

function getStrings(language?: string): LanguageStrings {
  return STRINGS[normalizeLanguage(language)];
}

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength - 3)}...`;
}

function getEvidenceSource(rec: RecommendationOutboxItem): string | null {
  if (!rec.explainability?.evidence) {
    return rec.sources_involved?.[0] || null;
  }

  const primaryEvidence = rec.explainability.evidence.find((e) => e.kind !== 'rule');
  if (!primaryEvidence) return null;

  return primaryEvidence.refs[0]?.source || null;
}

function getEvidenceKind(rec: RecommendationOutboxItem): string | null {
  if (!rec.explainability?.evidence) return null;

  const primaryEvidence = rec.explainability.evidence.find((e) => e.kind !== 'rule');
  return primaryEvidence?.kind || null;
}

function generateEvidenceBasedWhy(rec: RecommendationOutboxItem, language?: string): string {
  const s = getStrings(language);
  const kind = getEvidenceKind(rec);
  const source = getEvidenceSource(rec);
  const rationale = truncate(rec.rationale || `${s.basedOnActivity}.`, 100);

  if (!kind) {
    return rationale;
  }

  const rationaleLower = rationale.toLowerCase().replace(/\.$/, '');

  switch (kind) {
    case 'state':
      if (source) {
        return `${s.basedOn} ${source} ${s.activity}, ${rationaleLower}.`;
      }
      return `${s.currentState}, ${rationaleLower}.`;

    case 'event':
      if (source) {
        return `${s.eventIndicates} ${rationaleLower}.`;
      }
      return `${s.upcomingEvent} ${rationaleLower}.`;

    case 'correlation':
      return `${s.crossSourceAnalysis} ${rationaleLower}.`;

    case 'heuristic':
      return `${s.activityPatterns} ${rationaleLower}.`;

    default:
      return rationale;
  }
}

function generateRecap(
  priorities: PriorityItem[],
  recommendations: RecommendationOutboxItem[],
  language?: string,
): string {
  const s = getStrings(language);

  if (priorities.length === 0) {
    return s.reviewSchedule;
  }

  const sources = new Set<string>();
  recommendations.slice(0, 3).forEach((rec) => {
    const source = getEvidenceSource(rec);
    if (source) sources.add(source);
  });

  const sourceList = Array.from(sources);
  const titleList = priorities.slice(0, 3).map((p) => p.title).join(', ');

  if (sourceList.length === 0) {
    return `${s.focusOn}: ${titleList}.`;
  }

  const lastSource = sourceList[sourceList.length - 1] || '';
  const sourceText =
    sourceList.length === 1
      ? sourceList[0]
      : `${sourceList.slice(0, -1).join(', ')} ${s.and} ${lastSource}`;

  return `${s.basedOn} ${sourceText} ${s.activity}, ${s.yourKeyFocusAreas}: ${titleList}.`;
}

function generateScheduleFromPriorities(priorities: PriorityItem[], language?: string): ScheduleItem[] {
  const s = getStrings(language);
  const schedule: ScheduleItem[] = [];

  const morningItems = priorities.filter((p) => p.rank <= 2).map((p) => p.title);
  if (morningItems.length > 0) {
    schedule.push({
      time_window: 'morning',
      focus: s.priorityTasks,
      items: morningItems,
    });
  }

  const middayItems = priorities.filter((p) => p.rank === 3).map((p) => p.title);
  if (middayItems.length > 0) {
    schedule.push({
      time_window: 'midday',
      focus: s.continuedWork,
      items: middayItems,
    });
  }

  const afternoonItems = priorities.filter((p) => p.rank > 3).map((p) => p.title);
  if (afternoonItems.length > 0) {
    schedule.push({
      time_window: 'afternoon',
      focus: s.additionalTasks,
      items: afternoonItems,
    });
  }

  if (schedule.length === 0 && priorities.length > 0) {
    schedule.push({
      time_window: 'morning',
      focus: s.todaysPriorities,
      items: priorities.slice(0, 3).map((p) => p.title),
    });
  }

  return schedule;
}

function generateDeterministicPlan(
  userId: string,
  date: string,
  recommendations: RecommendationOutboxItem[],
  language?: string,
): AiDailyPlan {
  const s = getStrings(language);
  const topRecs = recommendations.slice(0, 3);

  const priorities: PriorityItem[] = topRecs.map((rec, index) => {
    const priority: PriorityItem = {
      rank: index + 1,
      title: truncate(rec.title, 80),
      why: truncate(generateEvidenceBasedWhy(rec, language), 200),
      linked_candidate_ids: [rec.candidate_id],
    };

    if (rec.action_proposal) {
      priority.action_proposal = {
        proposal_id: rec.action_proposal.proposal_id,
        title: rec.action_proposal.title,
        description: rec.action_proposal.description,
        steps: (rec.action_proposal.steps || []).map((step) => ({
          step_id: step.step_id,
          capability: step.capability,
          description: step.description,
          params: step.params,
          depends_on: step.depends_on,
          optional: step.optional,
        })),
        requires_approval: rec.action_proposal.requires_approval,
        estimated_impact: rec.action_proposal.estimated_impact,
        reversible: rec.action_proposal.reversible,
        risk: rec.action_proposal.risk,
      };
    }

    return priority;
  });

  if (priorities.length === 0) {
    priorities.push({
      rank: 1,
      title: s.reviewYourDay,
      why: s.noRecommendations,
      linked_candidate_ids: [],
    });
  }

  const scheduleSuggestion = generateScheduleFromPriorities(priorities, language);

  if (scheduleSuggestion.length === 0) {
    scheduleSuggestion.push({
      time_window: 'morning',
      focus: s.planYourDay,
      items: [s.reviewPriorities],
    });
  }

  return {
    user_id: userId,
    date,
    plan_title: s.planTitle,
    priorities,
    schedule_suggestion: scheduleSuggestion,
    recap: generateRecap(priorities, recommendations, language),
    notes: [],
    safety: {
      no_new_facts: true,
      numerals_allowed: false,
      checked: true,
    },
    generated_at: new Date().toISOString(),
  };
}

export {
  generateDeterministicPlan,
  truncate,
  generateRecap,
  generateEvidenceBasedWhy,
  generateScheduleFromPriorities,
  getEvidenceSource,
  getEvidenceKind,
  getStrings,
  normalizeLanguage,
};

export type { SupportedLanguage, LanguageStrings };
