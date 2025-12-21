/*
 * LICENSE PLACEHOLDER
 */

interface WhyContext {
  subject_name?: string;
  class_name?: string;
  project_name?: string;
  title?: string;
  is_exam?: boolean;
  has_attachments?: boolean;
  attachments?: Array<{ filename: string }>;
  is_important?: boolean;
  minutes_until?: number;
  thread_count?: number;
  [key: string]: unknown;
}

type WhyTemplate = (ctx: WhyContext) => string;

type SupportedLanguage = 'de' | 'en' | 'fr';

const WHY_TEMPLATES: Record<string, Record<SupportedLanguage, WhyTemplate>> = {
  'conference.created': {
    de: (ctx) =>
      `Konferenz "${ctx.subject_name || 'Veranstaltung'}" wurde erstellt. Workspace-Einrichtung verbessert die Organisation.`,
    en: (ctx) =>
      `Conference "${ctx.subject_name || 'Event'}" was created. Setting up a workspace improves organization.`,
    fr: (ctx) =>
      `La conférence "${ctx.subject_name || 'Événement'}" a été créée. La configuration d'un espace de travail améliore l'organisation.`,
  },

  'class.created': {
    de: (ctx) =>
      `Klasse "${ctx.class_name}" wurde angelegt. Ordnerstruktur und Chat ermöglichen Zusammenarbeit.`,
    en: (ctx) =>
      `Class "${ctx.class_name}" was created. Folder structure and chat enable collaboration.`,
    fr: (ctx) =>
      `La classe "${ctx.class_name}" a été créée. La structure des dossiers et le chat permettent la collaboration.`,
  },

  'project.created': {
    de: (ctx) =>
      `Projekt "${ctx.project_name}" wurde erstellt. Eigener Workspace verbessert die Teamkoordination.`,
    en: (ctx) =>
      `Project "${ctx.project_name}" was created. A dedicated workspace improves team coordination.`,
    fr: (ctx) =>
      `Le projet "${ctx.project_name}" a été créé. Un espace de travail dédié améliore la coordination de l'équipe.`,
  },

  'survey.created': {
    de: (ctx) =>
      `Umfrage "${ctx.title}" wurde erstellt. Ankündigung hilft, Teilnehmer zu erreichen.`,
    en: (ctx) =>
      `Survey "${ctx.title}" was created. Announcement helps reach participants.`,
    fr: (ctx) =>
      `Le sondage "${ctx.title}" a été créé. L'annonce aide à atteindre les participants.`,
  },

  'session.started': {
    de: (ctx) =>
      ctx.is_exam
        ? `Prüfungssitzung für "${ctx.class_name}" gestartet. Vorbereitung sichert reibungslosen Ablauf.`
        : `Sitzung für "${ctx.class_name}" gestartet.`,
    en: (ctx) =>
      ctx.is_exam
        ? `Exam session for "${ctx.class_name}" started. Preparation ensures smooth execution.`
        : `Session for "${ctx.class_name}" started.`,
    fr: (ctx) =>
      ctx.is_exam
        ? `Session d'examen pour "${ctx.class_name}" démarrée. La préparation assure un déroulement fluide.`
        : `Session pour "${ctx.class_name}" démarrée.`,
  },

  'mail.received': {
    de: (ctx) =>
      ctx.has_attachments
        ? `E-Mail mit ${ctx.attachments?.length || 'mehreren'} Anhang/Anhängen empfangen. Speichern in Dateien verbessert Zugriff.`
        : `E-Mail empfangen.`,
    en: (ctx) =>
      ctx.has_attachments
        ? `Email received with ${ctx.attachments?.length || 'multiple'} attachment(s). Saving to files improves access.`
        : `Email received.`,
    fr: (ctx) =>
      ctx.has_attachments
        ? `E-mail reçu avec ${ctx.attachments?.length || 'plusieurs'} pièce(s) jointe(s). L'enregistrement améliore l'accès.`
        : `E-mail reçu.`,
  },

  'bulletin.created': {
    de: (ctx) =>
      ctx.is_important
        ? `Wichtige Mitteilung "${ctx.title}" erstellt. Chat-Benachrichtigung sichert Sichtbarkeit.`
        : `Mitteilung "${ctx.title}" erstellt.`,
    en: (ctx) =>
      ctx.is_important
        ? `Important announcement "${ctx.title}" created. Chat notification ensures visibility.`
        : `Announcement "${ctx.title}" created.`,
    fr: (ctx) =>
      ctx.is_important
        ? `Annonce importante "${ctx.title}" créée. La notification par chat assure la visibilité.`
        : `Annonce "${ctx.title}" créée.`,
  },

  'meeting.upcoming': {
    de: (ctx) =>
      `Ein Termin steht ${ctx.minutes_until ? 'in wenigen Stunden' : 'heute'} an. Vorbereitung reduziert Kontextwechsel.`,
    en: (ctx) =>
      `A meeting is scheduled ${ctx.minutes_until ? 'in a few hours' : 'today'}. Preparation reduces context switching.`,
    fr: (ctx) =>
      `Une réunion est prévue ${ctx.minutes_until ? 'dans quelques heures' : "aujourd'hui"}. La préparation réduit les changements de contexte.`,
  },

  'communication.awaiting': {
    de: (ctx) =>
      `${ctx.thread_count || 'Einige'} Konversation(en) warten auf Antwort. Nachfassen erhält den Kommunikationsfluss.`,
    en: (ctx) =>
      `${ctx.thread_count || 'Some'} conversation(s) awaiting reply. Following up maintains communication flow.`,
    fr: (ctx) =>
      `${ctx.thread_count || 'Plusieurs'} conversation(s) en attente de réponse. Le suivi maintient le flux de communication.`,
  },

  'activity.low': {
    de: () => `Aktivitätsniveau ist niedrig. Gute Gelegenheit, offene Punkte anzugehen.`,
    en: () => `Activity level is low. Good opportunity to address open items.`,
    fr: () => `Le niveau d'activité est faible. Bonne occasion de traiter les points en suspens.`,
  },
};

const FALLBACK_MESSAGES: Record<SupportedLanguage, string> = {
  de: 'Ausgelöst durch',
  en: 'Triggered by',
  fr: 'Déclenché par',
};

const RULE_LABELS: Record<SupportedLanguage, string> = {
  de: 'Regel',
  en: 'Rule',
  fr: 'Règle',
};

function normalizeLanguage(lang?: string): SupportedLanguage {
  if (!lang) return 'de';
  const normalized = lang.toLowerCase().slice(0, 2);
  if (normalized === 'en' || normalized === 'de' || normalized === 'fr') {
    return normalized;
  }
  return 'de';
}

function generateWhyText(
  triggerAction: string,
  context: WhyContext = {},
  language?: string,
): string {
  const lang = normalizeLanguage(language);
  const templates = WHY_TEMPLATES[triggerAction];

  if (templates) {
    const template = templates[lang] || templates.de || templates.en;
    if (template) {
      return template(context);
    }
  }

  const fallback = FALLBACK_MESSAGES[lang] || FALLBACK_MESSAGES.de;
  return `${fallback} ${triggerAction}.`;
}

function generateSummary(
  rationale: string,
  ruleId: string,
  ruleVersion: string,
  language?: string,
): string {
  const lang = normalizeLanguage(language);
  const label = RULE_LABELS[lang] || RULE_LABELS.de;
  return `${rationale} ${label}: ${ruleId} v${ruleVersion}.`;
}

export { WHY_TEMPLATES, generateWhyText, generateSummary, normalizeLanguage };
export type { WhyContext, WhyTemplate, SupportedLanguage };
