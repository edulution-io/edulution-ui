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

import { Types } from 'mongoose';
import getBase24HexStringFromDate from '@libs/survey/utils/getBase24HexStringFromDate';

const ParentTeacherConference = {
  _id: new Types.ObjectId(getBase24HexStringFromDate(new Date('2004-04-04T14:14:14.140Z'))),
  name: 'Eltern-Abend',
  isDefaultTemplate: true,
  isActive: true,
  schemaVersion: 1,
  template: {
    formula: {
      title: 'Eltern-Abend (DATUM?)',
      logo: `/edu-api/files/public/assets/surveys/surveys-default-logo-dark.webp`,
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
                url: `/edu-api/public-surveys/choices/temporalSurveyId/Frage1`,
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
                url: `/edu-api/public-surveys/choices/temporalSurveyId/Frage2`,
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

export default ParentTeacherConference;
