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

import { Types } from 'mongoose';
import { Survey, SurveyDocument } from '../../survey.schema';
import { firstMockUser, secondMockUser } from '../user';

// -------------------------
// Public Survey 01
// -------------------------
export const idOfPublicSurvey01 = new Types.ObjectId();
export const publicSurvey01: SurveyDocument = {
  _id: idOfPublicSurvey01,
  id: idOfPublicSurvey01,
  creator: firstMockUser,
  formula: {
    title: 'Public Survey 01',
    description: 'This is a public test survey',
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
  invitedAttendees: [],
  invitedGroups: [],
  participatedAttendees: [],
  answers: [],
  saveNo: 117,
  createdAt: new Date('2021-06-26T00:00:00.000Z'),
  expires: new Date('2021-06-26T12:00:00.000Z'),
  isAnonymous: false,
  isPublic: true,
  canSubmitMultipleAnswers: false,
  canUpdateFormerAnswer: false,
} as unknown as SurveyDocument;

// -------------------------
// Public Survey 02
// -------------------------
export const idOfPublicSurvey02 = new Types.ObjectId();
export const saveNoPublicSurvey02: number = 3;

export const idOfTheValidSurveyAnswerForThePublicSurvey02 = new Types.ObjectId();
export const mockedValidAnswerForPublicSurveys02: JSON = JSON.parse('{"Frage1": "Max", "Frage2": "choice1"}') as JSON;
export const surveyValidAnswerPublicSurvey02: SurveyDocument = {
  _id: idOfTheValidSurveyAnswerForThePublicSurvey02,
  id: idOfTheValidSurveyAnswerForThePublicSurvey02,
  surveyId: idOfPublicSurvey02,
  saveNo: saveNoPublicSurvey02,
  attendee: firstMockUser,
  answer: mockedValidAnswerForPublicSurveys02,
} as unknown as SurveyDocument;

export const idOfTheInvalidSurveyAnswerForThePublicSurvey02 = new Types.ObjectId();
export const mockedInvalidAnswerForPublicSurveys02: JSON = JSON.parse('{"Frage1": "Max", "Frage2": "choice0"}') as JSON;
export const surveyInvalidAnswerPublicSurvey02: SurveyDocument = {
  _id: idOfTheInvalidSurveyAnswerForThePublicSurvey02,
  id: idOfTheInvalidSurveyAnswerForThePublicSurvey02,
  surveyId: idOfPublicSurvey02,
  saveNo: saveNoPublicSurvey02,
  attendee: firstMockUser,
  answer: mockedInvalidAnswerForPublicSurveys02,
} as unknown as SurveyDocument;

export const publicSurvey02QuestionNameWithLimiters = 'Frage2';
export const publicSurvey02BackendLimiter = [
  {
    questionName: publicSurvey02QuestionNameWithLimiters,
    choices: [
      { name: 'choice0', title: 'CanBeSelected0times', limit: 0 },
      { name: 'choice1', title: 'CanBeSelected1times', limit: 1 },
      { name: 'choice2', title: 'CanBeSelected2times', limit: 2 },
      { name: 'choice3', title: 'CanBeSelected3times', limit: 3 },
    ],
  },
];
export const filteredChoices = [
  { name: 'choice0', title: 'CanBeSelected0times', limit: 0 },
  { name: 'choice1', title: 'CanBeSelected1times', limit: 1 },
  { name: 'choice2', title: 'CanBeSelected2times', limit: 2 },
  { name: 'choice3', title: 'CanBeSelected3times', limit: 3 },
];
export const filteredChoicesAfterAddingValidAnswer = [
  { name: 'choice0', title: 'CanBeSelected0times', limit: 0 },
  { name: 'choice2', title: 'CanBeSelected2times', limit: 2 },
  { name: 'choice3', title: 'CanBeSelected3times', limit: 3 },
];

export const publicSurvey02: Survey = {
  _id: idOfPublicSurvey02,
  id: idOfPublicSurvey02,
  creator: secondMockUser,
  formula: {
    title: 'Public Survey 03',
    description: 'This is a public test survey with backend limiters',
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
  backendLimiters: publicSurvey02BackendLimiter,
  invitedAttendees: [],
  invitedGroups: [],
  participatedAttendees: [],
  answers: [],
  saveNo: saveNoPublicSurvey02,
  createdAt: new Date('2020-11-29T00:00:00.000Z'),
  expires: new Date('9999-12-28T14:30:00.000Z'),
  isAnonymous: false,
  isPublic: true,
  canSubmitMultipleAnswers: false,
  canUpdateFormerAnswer: true,
} as unknown as SurveyDocument;

export const publicSurvey02AfterAddingValidAnswer: Survey = {
  ...publicSurvey02,
  answers: [idOfTheValidSurveyAnswerForThePublicSurvey02],
};
