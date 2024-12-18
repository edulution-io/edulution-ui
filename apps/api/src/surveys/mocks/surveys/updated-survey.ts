import SurveyDto from '@libs/survey/types/api/survey.dto';
import getNewSurveyId from '@libs/survey/getNewSurveyId';
import { firstUsername, secondUsername } from '../user/usernames';
import { firstMockUser, secondMockUser } from '../user/users';
import { mockedParticipants } from '../user/participants';
import { Survey } from '../../survey.schema';

export const surveyUpdateSurveyId = getNewSurveyId();

export const surveyUpdateInitialSurvey: Survey = {
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
  invitedAttendees: [],
  invitedGroups: [],
  participatedAttendees: [],
  answers: [],
  saveNo: 1,
  created: new Date('2020-11-29T00:00:00.000Z'),
  expires: new Date('2025-04-22T14:30:00.000Z'),
  isAnonymous: false,
  canSubmitMultipleAnswers: false,
  isPublic: false,
};

export const surveyUpdateUpdatedSurvey: Survey = {
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
  created: new Date('2020-11-29T00:00:00.000Z'),
  expires: new Date('2025-04-22T14:30:00.000Z'),
  isAnonymous: false,
  canSubmitMultipleAnswers: false,
  isPublic: false,
};
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
  participatedAttendees: [
    { ...firstMockUser, label: 'pupil1-name1', value: firstUsername },
    { ...secondMockUser, label: 'pupil2-name2', value: secondUsername },
  ],
  saveNo: 1,
  isPublic: false,
};
