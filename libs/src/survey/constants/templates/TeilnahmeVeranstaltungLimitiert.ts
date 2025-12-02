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

const eduHost = process.env['EDUI_HOST'] ?? 'localhost';
const eduPort = process.env['EDUI_PORT'] ?? '3001';
const frontendHost = process.env['FRONTEND_HOST'] ?? 'localhost';
const frontendPort = process.env['FRONTEND_PORT'] ?? '5173';

const TeilnahmeVeranstaltungLimitiert = {
  name: 'TeilnahmeVeranstaltungLimitiert',
  isDefaultTemplate: true,
  isActive: false,
  schemaVersion: 1,
  template: {
    formula: {
      title: 'Anmeldung zur Veranstaltung',
      logo: `http://${frontendHost}:${frontendPort}/edu-api/files/public/file/surveys/surveys-default-logo-dark.webp`,
      description: 'Möchtest du an der Veranstaltung teilnehmen?',
      pages: [
        {
          name: 'Seite1',
          elements: [
            {
              type: 'text',
              name: 'Frage1',
              title: 'Dein Name',
              description: 'Gerne auch ein Spitzname oder Alias, falls gewünscht.',
              isRequired: true,
            },
            {
              type: 'radiogroup',
              name: 'Frage2',
              title: 'Bitte wähle den für dich passenden Termin aus',
              description:
                'Die Teilnehmerzahl pro Termin ist auf 20 begrenzt. Ausgebuchte Termine werden nicht mehr angezeigt.',
              choicesByUrl: {
                url: `http://${eduHost}:${eduPort}/edu-api/public-surveys/choices/temporalSurveyId/Frage2`,
                valueName: 'name',
                titleName: 'title',
                allowEmptyResponse: true,
              },
              choicesOrder: 'asc',
            },
            {
              type: 'text',
              name: 'Frage3',
              title: 'Deine E-Mail Adresse (optional)',
              description:
                'Bitte nur angeben, wenn Sie benachrichtigt werden möchten, falls ein Platz frei wird oder Sie über zukünftige Veranstaltungen informiert werden möchten.',
            },
          ],
          title: 'Titel des Vortrags',
          description: 'Bitte gib an, worum es in dem Vortrag geht.',
        },
      ],
    },
    backendLimiters: [
      {
        questionName: 'Frage2',
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
    canUpdateFormerAnswer: true,
  },
};

export default TeilnahmeVeranstaltungLimitiert;
