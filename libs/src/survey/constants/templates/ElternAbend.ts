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

const host = process.env['EDUI_HOST'] ?? 'localhost';
const port = process.env['EDUI_PORT'] ?? '3001';
const protocol = window.location.protocol || 'http:';
const frontend = window.location.host || `localhost:5173`;

const ElternAbend = {
  fileName: 'Eltern-Abend',
  isActive: true,
  schemaVersion: 1,
  template: {
    formula: {
      title: 'Eltern-Abend (DATUM?)',
      logo: `${protocol}//${frontend}/edu-api/files/public/file/surveys/surveys-default-logo-dark.webp`,
      description: 'Auf jeder Seite bietet der Lehrer eines Faches in der jeweiligen Klasse verschiedene Timeslots an.',
      pages: [
        {
          name: 'Seite1',
          elements: [
            {
              type: 'radiogroup',
              name: 'Frage1',
              title: 'Bitte wähle den entsprechenden Timeslot aus, der dir am besten passt',
              description:
                'Als Erziehungsberechtigte Person kann ein Termin pro Schüler:in, Fach und Klasse gebucht werden; Bereits belegte Termine werden ausgeblendet',
              choicesByUrl: {
                url: `http://${host}:${port}/edu-api/public-surveys/choices/temporalSurveyId/Frage1`,
                valueName: 'name',
                titleName: 'title',
                allowEmptyResponse: true,
              },
              choicesOrder: 'asc',
            },
          ],
          title: '1a Mathematik',
          description: 'Herr Musterfrau',
        },
        {
          name: 'Seite2',
          elements: [
            {
              type: 'radiogroup',
              name: 'Frage2',
              title: 'Bitte wähle den entsprechenden Timeslot aus, der dir am besten passt',
              description:
                'Als Erziehungsberechtigte Person kann ein Termin pro Schüler:in, Fach und Klasse gebucht werden; Bereits belegte Termine werden ausgeblendet',
              choicesByUrl: {
                url: `http://${host}:${port}/edu-api/public-surveys/choices/temporalSurveyId/Frage2`,
                valueName: 'name',
                titleName: 'title',
                allowEmptyResponse: true,
              },
              choicesOrder: 'asc',
            },
          ],
          title: '1a Deutsch',
          description: 'Frau Musterman',
        },
      ],
    },
    backendLimiters: [
      {
        questionName: 'Frage1',
        choices: [
          {
            name: 'choice0',
            title: '16:00 Uhr',
            limit: 1,
          },
          {
            name: 'choice1',
            title: '16:15 Uhr',
            limit: 1,
          },
          {
            name: 'choice2',
            title: '16:30 Uhr',
            limit: 1,
          },
          {
            name: 'choice3',
            title: '16:45 Uhr',
            limit: 1,
          },
          {
            name: 'choice4',
            title: '17:00 Uhr',
            limit: 1,
          },
          {
            name: 'choice5',
            title: '17:15 Uhr',
            limit: 1,
          },
          {
            name: 'choice6',
            title: '17:30 Uhr',
            limit: 1,
          },
          {
            name: 'choice7',
            title: '17:45 Uhr',
            limit: 1,
          },
          {
            name: 'choice8',
            title: '18:00 Uhr',
            limit: 1,
          },
          {
            name: 'choice9',
            title: '18:15 Uhr',
            limit: 1,
          },
          {
            name: 'choice10',
            title: '18:30 Uhr',
            limit: 1,
          },
          {
            name: 'choice11',
            title: '18:45 Uhr',
            limit: 1,
          },
          {
            name: 'choice12',
            title: '19:00 Uhr',
            limit: 1,
          },
          {
            name: 'choice13',
            title: '19:15 Uhr',
            limit: 1,
          },
          {
            name: 'choice14',
            title: '19:30 Uhr',
            limit: 1,
          },
          {
            name: 'choice15',
            title: '19:45 Uhr',
            limit: 1,
          },
          {
            name: 'choice16',
            title: '20:00 Uhr',
            limit: 1,
          },
        ],
      },
      {
        questionName: 'Frage2',
        choices: [
          {
            name: 'choice0',
            title: '16:00 Uhr',
            limit: 1,
          },
          {
            name: 'choice1',
            title: '16:15 Uhr',
            limit: 1,
          },
          {
            name: 'choice2',
            title: '16:30 Uhr',
            limit: 1,
          },
          {
            name: 'choice3',
            title: '16:45 Uhr',
            limit: 1,
          },
          {
            name: 'choice4',
            title: '17:00 Uhr',
            limit: 1,
          },
          {
            name: 'choice5',
            title: '17:15 Uhr',
            limit: 1,
          },
          {
            name: 'choice6',
            title: '17:30 Uhr',
            limit: 1,
          },
          {
            name: 'choice7',
            title: '17:45 Uhr',
            limit: 1,
          },
          {
            name: 'choice8',
            title: '18:00 Uhr',
            limit: 1,
          },
          {
            name: 'choice9',
            title: '18:15 Uhr',
            limit: 1,
          },
          {
            name: 'choice10',
            title: '18:30 Uhr',
            limit: 1,
          },
          {
            name: 'choice11',
            title: '18:45 Uhr',
            limit: 1,
          },
          {
            name: 'choice12',
            title: '19:00 Uhr',
            limit: 1,
          },
          {
            name: 'choice13',
            title: '19:15 Uhr',
            limit: 1,
          },
          {
            name: 'choice14',
            title: '19:30 Uhr',
            limit: 1,
          },
          {
            name: 'choice15',
            title: '19:45 Uhr',
            limit: 1,
          },
          {
            name: 'choice16',
            title: '20:00 Uhr',
            limit: 1,
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

export default ElternAbend;
