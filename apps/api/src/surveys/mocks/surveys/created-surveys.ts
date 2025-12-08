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
import SurveyDto from '@libs/survey/types/api/survey.dto';
import { SurveyDocument } from '../../survey.schema';
import { firstMockUser, secondMockUser } from '../user';

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
