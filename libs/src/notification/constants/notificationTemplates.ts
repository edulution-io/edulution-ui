/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
 *
 * This software is dual-licensed under the terms of:
 *
 * 1. The GNU Affero General Public License (AGPL-3.0-or-later), as published by the Free Software Foundation.
 *    You may use, modify and distribute this software under the terms of the AGPL, provided that you comply with its conditions.
 *
 *    A copy of the license can be found at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * OR
 *
 * 2. A commercial license agreement with Netzint GmbH. Licensees holding a valid commercial license from Netzint GmbH
 *    may use this software in accordance with the terms contained in such written agreement, without the obligations imposed by the AGPL.
 *
 * If you are uncertain which license applies to your use case, please contact us at info@netzint.de for clarification.
 */

const NOTIFICATION_TEMPLATES = {
  BULLETIN: {
    CREATED: {
      title: (bulletinTitle: string) => `Aushang bereit: ${bulletinTitle}`,
      body: (categoryName: string) => `Neuer Aushang in ${categoryName}`,
    },
    UPDATED: {
      title: (bulletinTitle: string) => `Aushang aktualisiert: ${bulletinTitle}`,
      body: (categoryName: string) => `Aktualisierter Aushang in ${categoryName}`,
    },
  },
  SURVEY: {
    CREATED: {
      title: (surveyTitle: string) => `Umfrage ${surveyTitle}: erstellt`,
      body: (surveyTitle: string) => `Die Umfrage "${surveyTitle}" wurde soeben erstellt.`,
    },
    UPDATED: {
      title: (surveyTitle: string) => `Umfrage ${surveyTitle}: aktualisiert`,
      body: (surveyTitle: string) => `Die Umfrage "${surveyTitle}" wurde soeben aktualisiert.`,
    },
  },
  CONFERENCE: {
    STARTED: {
      title: (conferenceName: string) => `Konferenz gestartet: ${conferenceName}`,
      body: (conferenceName: string) => `Die Konferenz "${conferenceName}" wurde gestartet.`,
    },
  },
  MAIL: {
    NEW: {
      title: (subject: string) => subject || 'Neue E-Mail',
      body: (from: string) => `Neue E-Mail von ${from}`,
    },
  },
} as const;

export default NOTIFICATION_TEMPLATES;
