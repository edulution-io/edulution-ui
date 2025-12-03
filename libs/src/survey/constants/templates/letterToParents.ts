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

// const eduHost = process.env['EDUI_HOST'] ?? 'localhost';
// const eduPort = process.env['EDUI_PORT'] ?? '3001';
// const frontendHost = process.env['FRONTEND_HOST'] ?? 'localhost';
// const frontendPort = process.env['FRONTEND_PORT'] ?? '5173';

const LetterToParents = {
  _id: '000000000000000000001111',
  name: 'Elternbrief',
  isDefaultTemplate: true,
  isActive: true,
  schemaVersion: 1,
  template: {
    formula: {
      title: 'Elternbrief – Rückmeldung erforderlich',
      logo: /* `http://${frontendHost}:${frontendPort} */ `/edu-api/files/public/file/surveys/surveys-default-logo-dark.webp`,
      description: 'Bitte geben Sie den Grund für die Benachrichtigung der Erziehungsberechtigten an.',
      pages: [
        {
          name: 'Seite1',
          elements: [
            {
              type: 'radiogroup',
              name: 'Frage1',
              title: 'Verfügbare Termine für ein Gespräch',
              description: 'Bitte wählen Sie einen passenden Termin für das Gespräch aus.',
              choicesByUrl: {
                url: /* `http://${eduHost}:${eduPort} */ `/edu-api/public-surveys/choices/temporalSurveyId/Frage1`,
                valueName: 'name',
                titleName: 'title',
                allowEmptyResponse: true,
              },
              choicesOrder: 'asc',
            },
            {
              type: 'signaturepad',
              name: 'Frage2',
              title: 'Unterschrift der erziehungsberechtigten Person',
              isRequired: true,
            },
          ],
          title: 'Anlass des Elternbriefs',
          description: 'Bitte beschreiben Sie kurz den Anlass (z. B. Erlaubnisanfrage, Vorfall im Unterricht etc.)',
        },
      ],
    },
    backendLimiters: [
      {
        questionName: 'Frage1',
        choices: [
          {
            name: 'choice0',
            title: '11:30 Uhr',
            limit: 20,
          },
          {
            name: 'choice1',
            title: '13:30 Uhr',
            limit: 20,
          },
          {
            name: 'choice2',
            title: '15:00 Uhr',
            limit: 20,
          },
        ],
      },
    ],
    creator: {
      firstName: 'Global',
      lastName: 'Admin',
      username: 'global-admin',
      value: 'global-admin',
      label: 'Global Admin',
    },
    invitedAttendees: [],
    invitedGroups: [],
    participatedAttendees: [],
    createdAt: '2025-06-20T10:06:21.593Z',
    isAnonymous: false,
    canSubmitMultipleAnswers: false,
    isPublic: false,
    canUpdateFormerAnswer: false,
  },
};

export default LetterToParents;
