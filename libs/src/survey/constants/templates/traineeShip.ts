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

// const frontendHost = process.env['FRONTEND_HOST'] ?? 'localhost';
// const frontendPort = process.env['FRONTEND_PORT'] ?? '5173';

const TraineeShip = {
  _id: '000000000000000000005555',
  name: 'Praktikumsplatz',
  isDefaultTemplate: true,
  isActive: true,
  schemaVersion: 1,
  template: {
    formula: {
      title: 'Praktikumsplatz Wunschliste',
      logo: /* `http://${frontendHost}:${frontendPort} */ `/edu-api/files/public/file/surveys/surveys-default-logo-dark.webp`,
      elements: [
        {
          type: 'paneldynamic',
          name: 'Frage1',
          title: 'Prioritätenliste möglicher Praktikumsplätze',
          description:
            'Bitte gib eine Prioritätenliste mit Unternehmen an, die für dich als Praktikumsplatz in Frage kommen. Beginne mit deiner höchsten Priorität.',
          templateElements: [
            {
              type: 'text',
              name: 'Frage2',
              title: 'Name des Unternehmens',
              isRequired: true,
            },
          ],
          minPanelCount: 3,
          maxPanelCount: 10,
          panelAddText: 'Weiteres Unternehmen hinzufügen',
        },
      ],
    },
    backendLimiters: [],
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
    canUpdateFormerAnswer: true,
  },
};

export default TraineeShip;
