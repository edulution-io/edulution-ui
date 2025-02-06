import { Types } from 'mongoose';
import { SurveyDocument } from '../../survey.schema';
import { firstMockUser, secondMockUser } from '../user';

export const createdSurveyId01 = new Types.ObjectId();
export const createdSurvey01: SurveyDocument = {
  _id: createdSurveyId01,
  id: createdSurveyId01,
  creator: firstMockUser,
  formula: {
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
  createdAt: new Date('2021-06-26T00:00:00.000Z'),
  expires: new Date('2044-08-22T12:00:00.000Z'),
  isAnonymous: false,
  canSubmitMultipleAnswers: false,
  canUpdateFormerAnswer: false,
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
