import mongoose from 'mongoose';
import { Survey } from '../../survey.schema';
import { firstMockUser, secondMockUser } from '../user/users';

// -------------------------
// Open Survey 01
// -------------------------
export const openSurveyId01 = new mongoose.Types.ObjectId(200);
export const openSurvey01: Survey = {
  _id: openSurveyId01,
  id: openSurveyId01,
  creator: secondMockUser,
  formula: {
    // @ts-expect-error: 'formula' has the following structure
    title: 'The Open Survey',
    description: 'This is open survey will be answered and move to the list of answered surveys',
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
};

// -------------------------
// Open Survey 02
// -------------------------
export const openSurveyId02 = new mongoose.Types.ObjectId(210);
export const openSurvey02: Survey = {
  _id: openSurveyId02,
  id: openSurveyId02,
  creator: secondMockUser,
  formula: {
    // @ts-expect-error: 'formula' has the following structure
    title: 'Open Survey 01',
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
};
