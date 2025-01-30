import getNewSurveyId from '@libs/survey/utils/getNewSurveyId';
import { Survey } from '../../survey.schema';
import { SurveyAnswer } from '../../survey-answer.schema';
import { firstMockUser, secondMockUser } from '../user';

// -------------------------
// Public Survey 01
// -------------------------
export const idOfPublicSurvey01 = getNewSurveyId();
export const publicSurvey01: Survey = {
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
  created: new Date('2021-06-26T00:00:00.000Z'),
  expires: new Date('2021-06-26T12:00:00.000Z'),
  isAnonymous: false,
  isPublic: true,
  canSubmitMultipleAnswers: false,
  canUpdateFormerAnswer: false,
};

// -------------------------
// Public Survey 02
// -------------------------
export const idOfPublicSurvey02 = getNewSurveyId();
export const saveNoPublicSurvey02: number = 3;

export const idOfTheValidSurveyAnswerForThePublicSurvey02 = getNewSurveyId();
export const mockedValidAnswerForPublicSurveys02: JSON = JSON.parse('{"Frage1": "Max", "Frage2": "choice1"}') as JSON;
export const surveyValidAnswerPublicSurvey02: SurveyAnswer = {
  _id: idOfTheValidSurveyAnswerForThePublicSurvey02,
  id: idOfTheValidSurveyAnswerForThePublicSurvey02,
  surveyId: idOfPublicSurvey02,
  saveNo: saveNoPublicSurvey02,
  attendee: firstMockUser,
  answer: mockedValidAnswerForPublicSurveys02,
};

export const idOfTheInvalidSurveyAnswerForThePublicSurvey02 = getNewSurveyId();
export const mockedInvalidAnswerForPublicSurveys02: JSON = JSON.parse('{"Frage1": "Max", "Frage2": "choice0"}') as JSON;
export const surveyInvalidAnswerPublicSurvey02: SurveyAnswer = {
  _id: idOfTheInvalidSurveyAnswerForThePublicSurvey02,
  id: idOfTheInvalidSurveyAnswerForThePublicSurvey02,
  surveyId: idOfPublicSurvey02,
  saveNo: saveNoPublicSurvey02,
  attendee: firstMockUser,
  answer: mockedInvalidAnswerForPublicSurveys02,
};

export const publicSurvey02QuestionIdWithLimiters = 'Frage2';
export const publicSurvey02BackendLimiter = [
  {
    questionId: publicSurvey02QuestionIdWithLimiters,
    choices: [
      { name: 'choice0', title: 'CanBeSelected0times', limit: 0 },
      { name: 'choice1', title: 'CanBeSelected1times', limit: 1 },
      { name: 'choice2', title: 'CanBeSelected2times', limit: 2 },
      { name: 'choice3', title: 'CanBeSelected3times', limit: 3 },
    ],
  },
];
export const filteredChoices = [
  { name: 'choice1', title: 'CanBeSelected1times', limit: 1 },
  { name: 'choice2', title: 'CanBeSelected2times', limit: 2 },
  { name: 'choice3', title: 'CanBeSelected3times', limit: 3 },
];
export const filteredChoicesAfterAddingValidAnswer = [
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
  created: new Date('2020-11-29T00:00:00.000Z'),
  expires: new Date('9999-12-28T14:30:00.000Z'),
  isAnonymous: false,
  isPublic: true,
  canSubmitMultipleAnswers: false,
  canUpdateFormerAnswer: true,
};

export const publicSurvey02AfterAddingValidAnswer: Survey = {
  ...publicSurvey02,
  answers: [idOfTheValidSurveyAnswerForThePublicSurvey02],
};
