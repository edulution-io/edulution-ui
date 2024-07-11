import mongoose from 'mongoose';
import SurveyDto from '@libs/survey/types/survey.dto';
import { Survey } from '../survey.schema';
import { mockedParticipants } from './participants';

// -------------------------
// Basic Created Survey
// -------------------------
export const idOfTheCreatedSurvey = new mongoose.Types.ObjectId(120);
export const theCreatedSurvey: Survey = {
  _id: idOfTheCreatedSurvey,
  id: idOfTheCreatedSurvey,
  formula: {
    // @ts-expect-error: 'formula' has the following structure
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
  saveNo: 1,
  created: new Date('2020-11-29T00:00:00.000Z'),
  expirationDate: new Date('2025-04-22'),
  expirationTime: '14:30',
  isAnonymous: false,
  canSubmitMultipleAnswers: false,
};
export const theCreatedSurveyDto: SurveyDto = {
  ...theCreatedSurvey,
  invitedAttendees: mockedParticipants,
  invitedGroups: [],
  saveNo: 1,
};

// -------------------------
// Updated Created Survey
// -------------------------
export const theUpdatedCreatedSurvey: Survey = {
  _id: idOfTheCreatedSurvey,
  id: idOfTheCreatedSurvey,
  formula: {
    // @ts-expect-error: 'formula' has the following structure
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
  saveNo: 2,
  created: new Date('2020-11-29T00:00:00.000Z'),
  expirationDate: new Date('2025-04-22'),
  expirationTime: '14:30',
  isAnonymous: false,
  canSubmitMultipleAnswers: false,
};
export const theUpdatedCreatedSurveyDto: SurveyDto = {
  ...theUpdatedCreatedSurvey,
  invitedAttendees: [],
  invitedGroups: [],
  saveNo: 2,
};
