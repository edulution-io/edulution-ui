/*
 * LICENSE
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

const frontendHost = process.env['FRONTEND_HOST'] ?? 'localhost';
const frontendPort = process.env['FRONTEND_PORT'] ?? '5173';

const Praktikumsplatz = {
  fileName: 'Praktikumsplatz',
  isActive: true,
  schemaVersion: 1,
  template: {
    formula: {
      title: 'Praktikumsplatz Wunschliste',
      logo: `http://${frontendHost}:${frontendPort}/edu-api/files/public/file/surveys/surveys-default-logo-dark.webp`,
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

export default Praktikumsplatz;
