/*
 * LICENSE PLACEHOLDER
 */

interface PushText {
  title: string;
  content: string;
}

interface PushContext {
  subject_name?: string;
  class_name?: string;
  project_name?: string;
  title?: string;
  attachment_count?: number;
  subject?: string;
  group_count?: number;
  thread_count?: number;
  unread_count?: number;
  stale_count?: number;
  [key: string]: unknown;
}

type PushTemplate = (ctx: PushContext) => PushText;

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 3)  }...`;
}

const PUSH_TEMPLATES: Record<string, PushTemplate> = {
  'reco.cross.conference_setup': (ctx) => ({
    title: truncate(`Workspace für ${ctx.subject_name || 'Konferenz'} einrichten`, 65),
    content: truncate(`Ordner und Chat für "${ctx.subject_name || 'Konferenz'}" erstellen? Tippen zum Bestätigen.`, 150),
  }),

  'reco.cross.class_setup': (ctx) => ({
    title: truncate(`Klasse ${ctx.class_name || ''} einrichten`, 65),
    content: truncate(`Ordnerstruktur, Chat und Willkommensnachricht für ${ctx.class_name || 'Klasse'} erstellen.`, 150),
  }),

  'reco.cross.project_setup': (ctx) => ({
    title: truncate(`Projekt "${ctx.project_name || ''}" einrichten`, 65),
    content: truncate(`Projektordner, Team-Chat und Share-Link für ${ctx.project_name || 'Projekt'} erstellen.`, 150),
  }),

  'reco.cross.survey_announce': (ctx) => ({
    title: truncate(`Umfrage "${ctx.title || ''}" ankündigen`, 65),
    content: truncate(`Bulletin für neue Umfrage erstellen? Teilnehmer werden informiert.`, 150),
  }),

  'reco.cross.session_exam': (ctx) => ({
    title: truncate(`Prüfung ${ctx.class_name || ''} vorbereiten`, 65),
    content: truncate(`Prüfungsordner anlegen und Exam-Modus für ${ctx.class_name || 'Klasse'} aktivieren.`, 150),
  }),

  'reco.cross.mail_attachment': (ctx) => ({
    title: truncate(`${ctx.attachment_count || ''} Anhänge speichern`, 65),
    content: truncate(`Anhänge aus "${ctx.subject || 'E-Mail'}" in Dateien speichern? Einfacher Zugriff.`, 150),
  }),

  'reco.cross.bulletin_notify': (ctx) => ({
    title: truncate(`Über "${ctx.title || 'Mitteilung'}" informieren`, 65),
    content: truncate(`Chat-Benachrichtigung an ${ctx.group_count || 'betroffene'} Gruppen senden.`, 150),
  }),

  'reco.meeting.upcoming': () => ({
    title: 'Meeting vorbereiten',
    content: truncate(`Ein Meeting steht an. Jetzt vorbereiten für weniger Kontextwechsel.`, 150),
  }),

  'reco.comm.awaiting_reply': (ctx) => ({
    title: 'Nachricht wartet auf Antwort',
    content: truncate(`${ctx.thread_count || 'Eine'} Konversation(en) warten auf Ihre Antwort.`, 150),
  }),

  'reco.focus.low_activity': () => ({
    title: 'Guter Zeitpunkt zum Aufholen',
    content: truncate(`Geringe Aktivität erkannt. Ideal für liegengebliebene Aufgaben.`, 150),
  }),

  'reco.focus.deep_work': () => ({
    title: 'Zeit für fokussierte Arbeit',
    content: truncate(`Keine Meetings in Sicht. Perfekt für konzentrierte Arbeit.`, 150),
  }),

  'reco.meeting.busy_schedule': () => ({
    title: 'Voller Terminkalender',
    content: truncate(`Mehrere Meetings heute. Pausen und Vorbereitung einplanen.`, 150),
  }),

  'reco.comm.high_volume': (ctx) => ({
    title: 'Viele ungelesene Nachrichten',
    content: truncate(`${ctx.unread_count || 'Mehrere'} ungelesene Nachrichten. Zeit zum Aufräumen.`, 150),
  }),

  'reco.planning.end_of_day': () => ({
    title: 'Tagesabschluss',
    content: truncate(`Tag fast vorbei. Offene Punkte prüfen und morgen planen.`, 150),
  }),

  'reco.cleanup.stale_threads': (ctx) => ({
    title: 'Alte Threads aufräumen',
    content: truncate(`${ctx.stale_count || 'Einige'} Konversationen ohne Aktivität. Archivieren?`, 150),
  }),
};

const DEFAULT_PUSH: PushText = {
  title: 'Neue Empfehlung',
  content: 'Eine neue Empfehlung ist verfügbar. Tippen für Details.',
};

function generatePushText(ruleId: string, context: PushContext = {}): PushText {
  const template = PUSH_TEMPLATES[ruleId];
  if (template) {
    return template(context);
  }
  return DEFAULT_PUSH;
}

export { PUSH_TEMPLATES, DEFAULT_PUSH, generatePushText, truncate };
export type { PushText, PushContext, PushTemplate };
