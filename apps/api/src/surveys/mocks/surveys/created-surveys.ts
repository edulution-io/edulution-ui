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
import { SurveyDocument } from '../../survey.schema';
import { firstMockUser, secondMockUser } from '../user';
import SurveyDto from '@libs/survey/types/api/survey.dto';

export const createdSurveyId01 = new Types.ObjectId();

export const createdSurvey01Questions = [
  {
    type: 'rating',
    name: 'Frage1',
    title: 'How likely is it, that you will recommend this product to a friend?',
  },
];

export const createdSurvey01Formula = {
  title: 'Created Survey 01',
  description: 'This is a test survey',
  elements: createdSurvey01Questions,
};

export const createSurvey01: SurveyDto = {
  creator: firstMockUser,
  formula: createdSurvey01Formula,
  invitedAttendees: [firstMockUser, secondMockUser],
  invitedGroups: [],
  participatedAttendees: [],
  answers: [],
  saveNo: 1,
  createdAt: new Date('2021-06-26T00:00:00.000Z'),
  expires: new Date('2044-08-22T12:00:00.000Z'),
  isAnonymous: false,
  canSubmitMultipleAnswers: false,
  canUpdateFormerAnswer: false,
} as unknown as SurveyDto;

export const createdSurvey01: SurveyDocument = {
  _id: createdSurveyId01,
  id: createdSurveyId01,
  ...createSurvey01,
} as unknown as SurveyDocument;

export const createdSurveyId02 = new Types.ObjectId();
export const createdSurvey02: SurveyDocument = {
  _id: createdSurveyId02,
  id: createdSurveyId02,
  creator: firstMockUser,
  formula: {
    title: 'New Create Created Survey',
    description: 'This is a test survey',
    elements: [
      {
        type: 'rating',
        name: 'Frage1',
        title: 'How likely is it, that you will recommend this product to a friend?',
      },
    ],
  },
  invitedAttendees: [firstMockUser, secondMockUser],
  invitedGroups: [],
  participatedAttendees: [],
  answers: [],
  saveNo: 12,
  createdAt: new Date('2021-06-26T00:00:00.000Z'),
  expires: new Date('2044-08-22T12:00:00.000Z'),
  isAnonymous: false,
  canSubmitMultipleAnswers: false,
  canUpdateFormerAnswer: false,
} as unknown as SurveyDocument;
