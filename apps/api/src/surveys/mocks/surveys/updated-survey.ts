import SurveyDto from '@libs/survey/types/api/survey.dto';
import getNewSurveyId from '@libs/survey/utils/getNewSurveyId';
import { firstUsername } from '../user/usernames';
import { firstMockUser } from '../user/users';
import { mockedParticipants } from '../user/participants';
import { Survey } from '../../survey.schema';

export const surveyUpdateSurveyId = getNewSurveyId();

export const initialSaveNo = 0;
export const surveyUpdateInitialSaveNo = 1;
const surveyUpdateUpdatedSaveNo = 2;
export const surveyUpdateNoTMatchingSaveNo = 5;

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
  invitedAttendees: mockedParticipants,
  invitedGroups: [],
  participatedAttendees: [],
  answers: [],
  saveNo: surveyUpdateInitialSaveNo,
  created: new Date('2020-11-29T00:00:00.000Z'),
  expires: new Date('2025-04-22T14:30:00.000Z'),
  isAnonymous: false,
  canSubmitMultipleAnswers: false,
  isPublic: false,
};
export const surveyUpdateInitialSurveyDto: SurveyDto = {
  ...surveyUpdateInitialSurvey,
  creator: {
    ...firstMockUser,
    label: 'pupil1-name1',
    value: firstUsername,
  },
  formula: surveyUpdateInitialSurvey.formula,
  invitedAttendees: mockedParticipants,
  invitedGroups: [],
  participatedAttendees: [],
  saveNo: initialSaveNo,
  created: new Date('2020-11-29T00:00:00.000Z'),
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
  invitedAttendees: mockedParticipants,
  invitedGroups: [],
  answers: [],
  saveNo: surveyUpdateUpdatedSaveNo,
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
  participatedAttendees: [],
  saveNo: surveyUpdateInitialSaveNo,
  created: new Date('2020-11-29T00:00:00.000Z'),
  isPublic: false,
};
