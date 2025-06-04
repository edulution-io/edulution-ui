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

import SurveyDto from '@libs/survey/types/api/survey.dto';
import { Types } from 'mongoose';
import { firstMockUser, firstUsername, mockedParticipants, secondMockUser } from '../user';
import { SurveyDocument } from '../../survey.schema';

export const surveyUpdateSurveyId = new Types.ObjectId();

export const surveyUpdateInitialSurvey: SurveyDocument = {
  _id: surveyUpdateSurveyId,
  id: surveyUpdateSurveyId,
  creator: firstMockUser,
  formula: {
    title: 'The created Survey',
    description: 'This is a test survey',
    elements: [
      {
        type: 'rating',
        name: 'Frage1',
        title: 'How likely is it, that you will recommend this product to a friend?',
      },
    ],
  },
  invitedAttendees: mockedParticipants,
  invitedGroups: [],
  participatedAttendees: [],
  answers: [],
  saveNo: 1,
  createdAt: new Date('2020-11-29T00:00:00.000Z'),
  expires: new Date('2025-04-22T14:30:00.000Z'),
  isAnonymous: false,
  canSubmitMultipleAnswers: false,
  isPublic: false,
} as unknown as SurveyDocument;

export const surveyUpdateInitialSurveyDto: SurveyDto = {
  ...surveyUpdateInitialSurvey,
  formula: surveyUpdateInitialSurvey.formula,
  creator: {
    ...firstMockUser,
    label: 'pupil1-name1',
    value: firstUsername,
  },
  invitedAttendees: mockedParticipants,
  invitedGroups: [],
  participatedAttendees: [firstMockUser, secondMockUser],
  answers: surveyUpdateInitialSurvey.answers.map((a) => a.toString()),
  saveNo: 1,
  isPublic: false,
};

export const surveyUpdateUpdatedSurvey: SurveyDocument = {
  _id: surveyUpdateSurveyId,
  id: surveyUpdateSurveyId,
  creator: firstMockUser,
  formula: {
    title: 'The created Survey After the update',
    description: 'This is an updated version of the basic test survey for the created survey',
    elements: [
      {
        type: 'rating',
        name: 'Frage1',
        title: 'How likely is it, that you will recommend this product to a friend?',
      },
    ],
  },
  participatedAttendees: [],
  invitedAttendees: [firstMockUser, secondMockUser],
  invitedGroups: [],
  answers: [],
  saveNo: 2,
  createdAt: new Date('2020-11-29T00:00:00.000Z'),
  expires: new Date('2025-04-22T14:30:00.000Z'),
  isAnonymous: false,
  canSubmitMultipleAnswers: false,
  isPublic: false,
} as unknown as SurveyDocument;

export const surveyUpdateUpdatedSurveyDto: SurveyDto = {
  ...surveyUpdateUpdatedSurvey,
  formula: surveyUpdateUpdatedSurvey.formula,
  creator: {
    ...firstMockUser,
    label: 'pupil1-name1',
    value: firstUsername,
  },
  invitedAttendees: mockedParticipants,
  invitedGroups: [],
  participatedAttendees: [firstMockUser, secondMockUser],
  answers: surveyUpdateInitialSurvey.answers.map((a) => a.toString()),
  saveNo: 1,
  isPublic: false,
};
