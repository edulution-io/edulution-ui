import mongoose from 'mongoose';
import { Survey } from '../../survey.schema';
import { firstMockUser, secondMockUser } from '../user/users';

// -------------------------
// Created Survey 01
// -------------------------
export const createdSurveyId01 = new mongoose.Types.ObjectId(110);
export const createdSurvey01: Survey = {
  _id: createdSurveyId01,
  id: createdSurveyId01,
  creator: firstMockUser,
  formula: {
    // @ts-expect-error: 'formula' has the following structure
    title: 'Created Survey 01',
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
  saveNo: 1,
  created: new Date('2021-06-26T00:00:00.000Z'),
  expirationDate: new Date('2044-08-22'),
  expirationTime: '12:00',
  isAnonymous: false,
  canSubmitMultipleAnswers: false,
  canUpdateFormerAnswer: false,
};

// -------------------------
// Create New
// -------------------------
export const createdSurveyId02 = new mongoose.Types.ObjectId(120);
export const createdSurvey02: Survey = {
  _id: createdSurveyId02,
  id: createdSurveyId02,
  creator: firstMockUser,
  formula: {
    // @ts-expect-error: 'formula' has the following structure
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
  created: new Date('2021-06-26T00:00:00.000Z'),
  expirationDate: new Date('2044-08-22'),
  expirationTime: '12:00',
  isAnonymous: false,
  canSubmitMultipleAnswers: false,
  canUpdateFormerAnswer: false,
};
