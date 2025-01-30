import getNewSurveyId from '@libs/survey/utils/getNewSurveyId';
import { Survey } from '../../survey.schema';
import { firstMockUser, secondMockUser } from '../user/users';

export const openSurveyId01 = getNewSurveyId();
export const openSurvey01: Survey = {
  _id: openSurveyId01,
  id: openSurveyId01,
  creator: secondMockUser,
  formula: {
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
  expires: new Date('2044-08-22T12:00:00.000Z'),
  isAnonymous: false,
  canSubmitMultipleAnswers: false,
};

export const openSurveyId02 = getNewSurveyId();
export const openSurvey02: Survey = {
  _id: openSurveyId02,
  id: openSurveyId02,
  creator: secondMockUser,
  formula: {
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
  expires: new Date('2044-08-22T12:00:00.000Z'),
  isAnonymous: false,
  canSubmitMultipleAnswers: false,
};
