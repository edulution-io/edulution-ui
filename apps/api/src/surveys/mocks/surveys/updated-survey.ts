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
