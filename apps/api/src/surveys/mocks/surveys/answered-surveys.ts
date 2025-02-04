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

import getNewSurveyId from '@libs/survey/getNewSurveyId';
import { Survey } from '../../survey.schema';
import { SurveyAnswer } from '../../survey-answer.schema';
import { firstMockUser, secondMockUser } from '../user';

// -------------------------
// Answered Survey 01
// -------------------------
export const idOfAnsweredSurvey01 = getNewSurveyId();

export const saveNoAnsweredSurvey01: number = 117;
const firstUsersMockedAnswerForTheAnsweredSurvey01 = getNewSurveyId();
const secondUsersMockedAnswerForTheAnsweredSurvey01 = getNewSurveyId();

export const firstUsersMockedAnswerForAnsweredSurveys01: JSON = JSON.parse('{"Frage1": "User1 Antwort1"}') as JSON;
export const secondUsersMockedAnswerForAnsweredSurveys01: JSON = JSON.parse('{"Frage1": "User2 Antwort1"}') as JSON;

export const firstUsersSurveyAnswerAnsweredSurvey01: SurveyAnswer = {
  _id: firstUsersMockedAnswerForTheAnsweredSurvey01,
  id: firstUsersMockedAnswerForTheAnsweredSurvey01,
  surveyId: idOfAnsweredSurvey01,
  saveNo: saveNoAnsweredSurvey01,
  attendee: firstMockUser,
  answer: firstUsersMockedAnswerForAnsweredSurveys01,
};

export const secondUsersSurveyAnswerAnsweredSurvey01: SurveyAnswer = {
  _id: secondUsersMockedAnswerForTheAnsweredSurvey01,
  id: secondUsersMockedAnswerForTheAnsweredSurvey01,
  surveyId: idOfAnsweredSurvey01,
  saveNo: saveNoAnsweredSurvey01,
  attendee: secondMockUser,
  answer: secondUsersMockedAnswerForAnsweredSurveys01,
};

export const answeredSurvey01: Survey = {
  _id: idOfAnsweredSurvey01,
  id: idOfAnsweredSurvey01,
  creator: secondMockUser,
  formula: {
    title: 'Answered Survey 01',
    description: 'This is a test survey',
    pages: [
      {
        name: 'Seite1',
        elements: [
          {
            type: 'checkbox',
            name: 'Frage1',
            choices: ['Item 1', 'Item 2', 'Item 3'],
          },
          {
            type: 'text',
            name: 'Frage2',
            title: 'text-input',
          },
        ],
      },
    ],
  },
  invitedAttendees: [firstMockUser, secondMockUser],
  invitedGroups: [],
  participatedAttendees: [],
  answers: [],
  saveNo: saveNoAnsweredSurvey01,
  created: new Date('2021-06-26T00:00:00.000Z'),
  expires: new Date('2021-06-26T12:00:00.000Z'),
  isAnonymous: false,
  canSubmitMultipleAnswers: false,
  canUpdateFormerAnswer: false,
};

// -------------------------
// Answered Survey 02
// -------------------------
export const idOfAnsweredSurvey02 = getNewSurveyId();

export const saveNoAnsweredSurvey02: number = 1;
export const idOfTheSurveyAnswerForTheAnsweredSurvey02 = getNewSurveyId();

export const mockedAnswerForAnsweredSurveys02: JSON = JSON.parse('{"Frage1": "Max", "Frage2": "Musterman"}') as JSON;

export const surveyAnswerAnsweredSurvey02: SurveyAnswer = {
  _id: idOfTheSurveyAnswerForTheAnsweredSurvey02,
  id: idOfTheSurveyAnswerForTheAnsweredSurvey02,
  surveyId: idOfAnsweredSurvey02,
  saveNo: saveNoAnsweredSurvey02,
  attendee: secondMockUser,
  answer: mockedAnswerForAnsweredSurveys02,
};

export const answeredSurvey02: Survey = {
  _id: idOfAnsweredSurvey02,
  id: idOfAnsweredSurvey02,
  creator: secondMockUser,
  formula: {
    title: 'Answered Survey 02',
    description: 'This is a page-less test survey',
    elements: [
      {
        type: 'text',
        name: 'Frage1',
        title: 'Firstname/Vorname',
      },
      {
        type: 'text',
        name: 'Frage2',
        title: 'Lastname/Nachname',
      },
    ],
  },
  invitedAttendees: [secondMockUser],
  invitedGroups: [],
  participatedAttendees: [secondMockUser],
  answers: [idOfTheSurveyAnswerForTheAnsweredSurvey02],
  saveNo: saveNoAnsweredSurvey02,
  created: new Date('2020-11-29T00:00:00.000Z'),
  expires: new Date('9999-12-28T14:30:00.000Z'),
  isAnonymous: false,
  canSubmitMultipleAnswers: false,
  canUpdateFormerAnswer: false,
};

// -------------------------
// Answered Survey 03
// -------------------------
export const idOfAnsweredSurvey03 = getNewSurveyId();

export const saveNoAnsweredSurvey03: number = 3;
const idOfTheSurveyAnswerForTheAnsweredSurvey03 = getNewSurveyId();

export const mockedAnswerForAnsweredSurveys03: JSON = JSON.parse('{"Frage1": "Max", "Frage2": "Musterman"}') as JSON;
export const updatedMockedAnswerForAnsweredSurveys03: JSON = JSON.parse(
  '{"Frage1": "Maximilian", "Frage2": "Musterman"}',
) as JSON;

export const surveyAnswerAnsweredSurvey03: SurveyAnswer = {
  _id: idOfTheSurveyAnswerForTheAnsweredSurvey03,
  id: idOfTheSurveyAnswerForTheAnsweredSurvey03,
  surveyId: idOfAnsweredSurvey03,
  saveNo: saveNoAnsweredSurvey03,
  attendee: firstMockUser,
  answer: mockedAnswerForAnsweredSurveys03,
};

export const answeredSurvey03BackendLimiter = [
  {
    questionId: 'Frage2',
    choices: [
      { name: 'choice0', title: 'CanBeSelected0times', limit: 0 },
      { name: 'choice1', title: 'CanBeSelected1times', limit: 1 },
      { name: 'choice2', title: 'CanBeSelected2times', limit: 2 },
      { name: 'choice3', title: 'CanBeSelected3times', limit: 3 },
    ],
  },
];

export const updatedSurveyAnswerAnsweredSurvey03: SurveyAnswer = {
  ...surveyAnswerAnsweredSurvey03,
  answer: updatedMockedAnswerForAnsweredSurveys03,
};

export const answeredSurvey03: Survey = {
  _id: idOfAnsweredSurvey03,
  id: idOfAnsweredSurvey03,
  creator: secondMockUser,
  formula: {
    title: 'Answered Survey 03',
    description: 'This is a page-less test survey',
    elements: [
      {
        type: 'text',
        name: 'Frage1',
        title: 'Firstname/Vorname',
      },
      {
        type: 'text',
        name: 'Frage2',
        title: 'Lastname/Nachname',
      },
    ],
  },
  backendLimiters: answeredSurvey03BackendLimiter,
  invitedAttendees: [firstMockUser, secondMockUser],
  invitedGroups: [],
  participatedAttendees: [firstMockUser],
  answers: [idOfTheSurveyAnswerForTheAnsweredSurvey03],
  saveNo: saveNoAnsweredSurvey03,
  created: new Date('2020-11-29T00:00:00.000Z'),
  expires: new Date('9999-12-28T14:30:00.000Z'),
  isAnonymous: false,
  canSubmitMultipleAnswers: false,
  canUpdateFormerAnswer: true,
};

// -------------------------
// Answered Survey 04
// -------------------------
export const idOfAnsweredSurvey04 = getNewSurveyId();

export const saveNoAnsweredSurvey04: number = 4;
export const idOfTheSurveyAnswerForTheAnsweredSurvey04 = getNewSurveyId();

export const mockedAnswerForAnsweredSurveys04: JSON = JSON.parse('{"Frage1": "Max", "Frage2": "Musterman"}') as JSON;

export const surveyAnswerAnsweredSurvey04: SurveyAnswer = {
  _id: idOfTheSurveyAnswerForTheAnsweredSurvey04,
  id: idOfTheSurveyAnswerForTheAnsweredSurvey04,
  surveyId: idOfAnsweredSurvey04,
  saveNo: saveNoAnsweredSurvey04,
  attendee: firstMockUser,
  answer: mockedAnswerForAnsweredSurveys04,
};

export const answeredSurvey04: Survey = {
  _id: idOfAnsweredSurvey04,
  id: idOfAnsweredSurvey04,
  creator: secondMockUser,
  formula: {
    title: 'Answered Survey 04',
    description: 'This is a page-less test survey',
    elements: [
      {
        type: 'text',
        name: 'Frage1',
        title: 'Firstname/Vorname',
      },
      {
        type: 'text',
        name: 'Frage2',
        title: 'Lastname/Nachname',
      },
    ],
  },
  invitedAttendees: [firstMockUser, secondMockUser],
  invitedGroups: [],
  participatedAttendees: [],
  answers: [],
  saveNo: saveNoAnsweredSurvey04,
  created: new Date('2020-11-29T00:00:00.000Z'),
  expires: new Date('9999-12-28T14:30:00.000Z'),
  isAnonymous: false,
  canSubmitMultipleAnswers: false,
  canUpdateFormerAnswer: false,
};

// -------------------------
// Answered Survey 05
// -------------------------
export const idOfAnsweredSurvey05 = getNewSurveyId();

export const saveNoAnsweredSurvey05: number = 5;
export const idOfTheSurveyAnswerForTheAnsweredSurvey05 = getNewSurveyId();

export const mockedAnswerForAnsweredSurveys05: JSON = JSON.parse('{"Frage1": "Max", "Frage2": "Musterman"}') as JSON;
export const newMockedAnswerForAnsweredSurveys05: JSON = JSON.parse(
  '{"Frage1": "Maximilian", "Frage2": "Musterman"}',
) as JSON;

export const surveyAnswerAnsweredSurvey05: SurveyAnswer = {
  _id: idOfTheSurveyAnswerForTheAnsweredSurvey05,
  id: idOfTheSurveyAnswerForTheAnsweredSurvey05,
  surveyId: idOfAnsweredSurvey05,
  saveNo: saveNoAnsweredSurvey05,
  attendee: firstMockUser,
  answer: mockedAnswerForAnsweredSurveys05,
};

export const newSurveyAnswerAnsweredSurvey05: SurveyAnswer = {
  _id: idOfTheSurveyAnswerForTheAnsweredSurvey05,
  id: idOfTheSurveyAnswerForTheAnsweredSurvey05,
  surveyId: idOfAnsweredSurvey05,
  saveNo: saveNoAnsweredSurvey05,
  attendee: firstMockUser,
  answer: mockedAnswerForAnsweredSurveys05,
};

export const answeredSurvey05: Survey = {
  _id: idOfAnsweredSurvey05,
  id: idOfAnsweredSurvey05,
  creator: secondMockUser,
  formula: {
    title: 'Answered Survey 04',
    description: 'This is a page-less test survey',
    elements: [
      {
        type: 'text',
        name: 'Frage1',
        title: 'Firstname/Vorname',
      },
      {
        type: 'text',
        name: 'Frage2',
        title: 'Lastname/Nachname',
      },
    ],
  },
  invitedAttendees: [firstMockUser, secondMockUser],
  invitedGroups: [],
  participatedAttendees: [firstMockUser],
  answers: [idOfTheSurveyAnswerForTheAnsweredSurvey05],
  saveNo: saveNoAnsweredSurvey05,
  created: new Date('2020-11-29T00:00:00.000Z'),
  expires: new Date('9999-12-28T14:30:00.000Z'),
  isAnonymous: false,
  canSubmitMultipleAnswers: true,
  canUpdateFormerAnswer: false,
};
