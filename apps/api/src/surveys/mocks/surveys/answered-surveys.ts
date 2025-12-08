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
import TSurveyAnswer from '@libs/survey/types/TSurveyAnswer';
import { Survey, SurveyDocument } from '../../survey.schema';
import { SurveyAnswer, SurveyAnswerDocument } from '../../survey-answers.schema';
import { firstMockUser, secondMockUser } from '../user';

// -------------------------
// Answered Survey 01
// -------------------------
export const idOfAnsweredSurvey01 = new Types.ObjectId();

export const saveNoAnsweredSurvey01: number = 117;
const firstUsersMockedAnswerForTheAnsweredSurvey01 = new Types.ObjectId();
const secondUsersMockedAnswerForTheAnsweredSurvey01 = new Types.ObjectId();

export const firstUsersMockedAnswerForAnsweredSurveys01: TSurveyAnswer = {
  Frage1: 'User1 Antwort1',
  identification: `${firstMockUser.firstName} ${firstMockUser.lastName}`,
};
export const secondUsersMockedAnswerForAnsweredSurveys01: TSurveyAnswer = {
  Frage1: 'User2 Antwort1',
  identification: `${firstMockUser.firstName} ${firstMockUser.lastName}`,
};

export const firstUsersSurveyAnswerAnsweredSurvey01: SurveyAnswerDocument = {
  _id: firstUsersMockedAnswerForTheAnsweredSurvey01,
  id: firstUsersMockedAnswerForTheAnsweredSurvey01,
  surveyId: idOfAnsweredSurvey01,
  saveNo: saveNoAnsweredSurvey01,
  attendee: firstMockUser,
  answer: firstUsersMockedAnswerForAnsweredSurveys01,
} as unknown as SurveyAnswerDocument;

export const secondUsersSurveyAnswerAnsweredSurvey01: SurveyAnswerDocument = {
  _id: secondUsersMockedAnswerForTheAnsweredSurvey01,
  id: secondUsersMockedAnswerForTheAnsweredSurvey01,
  surveyId: idOfAnsweredSurvey01,
  saveNo: saveNoAnsweredSurvey01,
  attendee: secondMockUser,
  answer: secondUsersMockedAnswerForAnsweredSurveys01,
} as unknown as SurveyAnswerDocument;

export const answeredSurvey01: SurveyDocument = {
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
  createdAt: new Date('2021-06-26T00:00:00.000Z'),
  expires: new Date('2021-06-26T12:00:00.000Z'),
  isAnonymous: false,
  canSubmitMultipleAnswers: false,
  canUpdateFormerAnswer: false,
} as unknown as SurveyDocument;

// -------------------------
// Answered Survey 02
// -------------------------
export const idOfAnsweredSurvey02 = new Types.ObjectId();

export const saveNoAnsweredSurvey02: number = 1;
export const idOfTheSurveyAnswerForTheAnsweredSurvey02 = new Types.ObjectId();

export const mockedAnswerForAnsweredSurveys02: TSurveyAnswer = { Frage1: 'Max', Frage2: 'Musterman' };

export const surveyAnswerAnsweredSurvey02: SurveyAnswerDocument = {
  _id: idOfTheSurveyAnswerForTheAnsweredSurvey02,
  id: idOfTheSurveyAnswerForTheAnsweredSurvey02,
  surveyId: idOfAnsweredSurvey02,
  saveNo: saveNoAnsweredSurvey02,
  attendee: secondMockUser,
  answer: mockedAnswerForAnsweredSurveys02,
} as unknown as SurveyAnswerDocument;

export const answeredSurvey02: SurveyDocument = {
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
  createdAt: new Date('2020-11-29T00:00:00.000Z'),
  expires: new Date('9999-12-28T14:30:00.000Z'),
  isAnonymous: false,
  canSubmitMultipleAnswers: false,
  canUpdateFormerAnswer: false,
} as unknown as SurveyDocument;

// -------------------------
// Answered Survey 03
// -------------------------
export const idOfAnsweredSurvey03 = new Types.ObjectId();

export const saveNoAnsweredSurvey03: number = 3;
const idOfTheSurveyAnswerForTheAnsweredSurvey03 = new Types.ObjectId();

export const mockedAnswerForAnsweredSurveys03: TSurveyAnswer = { Frage1: 'Max', Frage2: 'Musterman' };
export const updatedMockedAnswerForAnsweredSurveys03: TSurveyAnswer = { Frage1: 'Maximilian', Frage2: 'Musterman' };

export const surveyAnswerAnsweredSurvey03: SurveyAnswerDocument = {
  _id: idOfTheSurveyAnswerForTheAnsweredSurvey03,
  id: idOfTheSurveyAnswerForTheAnsweredSurvey03,
  surveyId: idOfAnsweredSurvey03,
  saveNo: saveNoAnsweredSurvey03,
  attendee: firstMockUser,
  answer: mockedAnswerForAnsweredSurveys03,
} as unknown as SurveyAnswerDocument;

export const answeredSurvey03BackendLimiter = [
  {
    questionName: 'Frage2',
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

export const answeredSurvey03: SurveyDocument = {
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
  createdAt: new Date('2020-11-29T00:00:00.000Z'),
  expires: new Date('9999-12-28T14:30:00.000Z'),
  isAnonymous: false,
  canSubmitMultipleAnswers: false,
  canUpdateFormerAnswer: true,
} as unknown as SurveyDocument;

// -------------------------
// Answered Survey 04
// -------------------------
export const idOfAnsweredSurvey04 = new Types.ObjectId();

export const saveNoAnsweredSurvey04: number = 4;
export const idOfTheSurveyAnswerForTheAnsweredSurvey04 = new Types.ObjectId();

export const mockedAnswerForAnsweredSurveys04: TSurveyAnswer = { Frage1: 'Max', Frage2: 'Musterman' };

export const surveyAnswerAnsweredSurvey04: SurveyAnswer = {
  _id: idOfTheSurveyAnswerForTheAnsweredSurvey04,
  id: idOfTheSurveyAnswerForTheAnsweredSurvey04,
  surveyId: idOfAnsweredSurvey04,
  saveNo: saveNoAnsweredSurvey04,
  attendee: firstMockUser,
  answer: mockedAnswerForAnsweredSurveys04,
} as unknown as SurveyAnswerDocument;

export const answeredSurvey04: SurveyDocument = {
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
} as unknown as SurveyDocument;

// -------------------------
// Answered Survey 05
// -------------------------
export const idOfAnsweredSurvey05 = new Types.ObjectId();

export const saveNoAnsweredSurvey05: number = 5;
export const idOfTheSurveyAnswerForTheAnsweredSurvey05 = new Types.ObjectId();

export const mockedAnswerForAnsweredSurveys05: TSurveyAnswer = { Frage1: 'Max', Frage2: 'Musterman' };
export const newMockedAnswerForAnsweredSurveys05: TSurveyAnswer = { Frage1: 'Maximilian', Frage2: 'Musterman' };

export const surveyAnswerAnsweredSurvey05: SurveyAnswer = {
  _id: idOfTheSurveyAnswerForTheAnsweredSurvey05,
  id: idOfTheSurveyAnswerForTheAnsweredSurvey05,
  surveyId: idOfAnsweredSurvey05,
  saveNo: saveNoAnsweredSurvey05,
  attendee: firstMockUser,
  answer: mockedAnswerForAnsweredSurveys05,
} as unknown as SurveyAnswerDocument;

export const newSurveyAnswerAnsweredSurvey05: SurveyAnswer = {
  _id: idOfTheSurveyAnswerForTheAnsweredSurvey05,
  id: idOfTheSurveyAnswerForTheAnsweredSurvey05,
  surveyId: idOfAnsweredSurvey05,
  saveNo: saveNoAnsweredSurvey05,
  attendee: firstMockUser,
  answer: mockedAnswerForAnsweredSurveys05,
} as unknown as SurveyAnswerDocument;

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
} as unknown as SurveyDocument;
