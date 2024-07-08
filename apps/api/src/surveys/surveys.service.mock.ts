import mongoose from 'mongoose';
import { Survey, SurveyDocument } from './survey.schema';
import SurveyDto from "@libs/survey/types/survey.dto";

export const newObjectId = new mongoose.Types.ObjectId(52653415245934);

export const firstMockSurveyId: mongoose.Types.ObjectId = new mongoose.Types.ObjectId(101);

export const secondMockSurveyId: mongoose.Types.ObjectId = new mongoose.Types.ObjectId(102);

export const thirdMockSurveyId: mongoose.Types.ObjectId = new mongoose.Types.ObjectId(103);

export const fourthMockSurveyId: mongoose.Types.ObjectId = new mongoose.Types.ObjectId(104);

export const firstUsername = 'pupil1-name1';
export const firstParticipant = {
  username: firstUsername,
  lastName: 'name1',
  firstName: 'pupil1',
  label: 'pupil1-name1',
  value: firstUsername,
};

export const secondUsername = 'pupil2-name2';
export const secondParticipant = {
  username: secondUsername,
  lastName: 'name2',
  firstName: 'pupil2',
  label: 'pupil2-name2',
  value: secondUsername,
};

export const thirdUsername = 'pupil3-name3';
export const thirdParticipant = {
  username: thirdUsername,
  lastName: 'name3',
  firstName: 'pupil3',
  label: 'pupil3-name3',
  value: thirdUsername,
};

export const mockedParticipants = [firstParticipant, secondParticipant, thirdParticipant];

// TODO: MOVE; THERE ARE NO MORE PUBLIC ANSWERS ON A SURVEY DOCUMENT
export const publicAnswerForFirstMockSurvey: JSON = {
  // @ts-ignore: 'publicAnswers' has this structure
  Frage1: ['Item 1'],
  Frage2: 'this is a mocked text input',
};

export const addNewPublicAnswerToFirstMockSurvey: JSON = {
  // @ts-ignore: 'publicAnswers' has this structure
  Frage1: ['Item 2'],
  Frage2: 'this is a second answer that will be added to the public answers of the survey',
};

export const firstMockSurvey: Survey = {
  _id: firstMockSurveyId,
  id: firstMockSurveyId,
  formula: {
    // @ts-ignore: 'formula' has the following structure
    title: 'First Survey',
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
  saveNo: 117,
  created: new Date('2021-06-26T00:00:00.000Z'),
  expirationDate: new Date('2021-06-26'),
  expirationTime: '12:00',
  isAnonymous: false,
  canSubmitMultipleAnswers: false,
};

export const secondMockSurvey: Survey = {
  _id: secondMockSurveyId,
  id: secondMockSurveyId,
  formula: {
    // @ts-ignore: 'formula' has the following structure
    title: 'Second Survey',
    description: 'This is a test survey (page-less)',
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
  saveNo: 2,
  created: new Date('2020-11-29T00:00:00.000Z'),
  expirationDate: new Date('2025-04-22'),
  expirationTime: '14:30',
  isAnonymous: false,
  canSubmitMultipleAnswers: false,
};

export const secondMockSurveyDto: SurveyDto = {
  ...secondMockSurvey,
  invitedAttendees: [],
  invitedGroups: [],
  saveNo: 1,
};

export const secondMockSurveyDocument: SurveyDocument = {
  ...secondMockSurvey,
  delete: jest.fn().mockResolvedValue(true),
  create: jest.fn().mockResolvedValue(secondMockSurvey),
  find: jest.fn().mockResolvedValue(secondMockSurvey),
  save: jest.fn().mockResolvedValue(secondMockSurvey),
  remove: jest.fn().mockResolvedValue(secondMockSurvey),
} as unknown as SurveyDocument;

export const mockSurveyIds: mongoose.Types.ObjectId[] = [firstMockSurveyId, secondMockSurveyId];

export const mockSurveys: Survey[] = [firstMockSurvey, secondMockSurvey];

export const thirdMockSurveyAddNewPublicAnswer: JSON = {
  // @ts-ignore: 'publicAnswers' has this structure
  Frage1: 'Lasagne',
};

export const thirdMockSurvey: Survey = {
  _id: thirdMockSurveyId,
  id: thirdMockSurveyId,
  formula: {
    // @ts-ignore: 'formula' has the following structure
    title: 'Third Survey',
    description: 'This is a third survey to test for user surveys inside of the controller.spec',
    elements: [
      {
        type: 'text',
        name: 'Frage1',
        title: 'FavouriteFood/LieblingsEssen',
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

export const fourthMockSurvey: Survey = {
  _id: fourthMockSurveyId,
  id: fourthMockSurveyId,
  formula: {
    // @ts-ignore: 'formula' has the following structure
    title: 'Fourth Survey',
    description: 'This is the fourth survey to add to the user surveys',
    elements: [
      {
        type: 'text',
        name: 'Frage1',
        title: 'FavouriteColor/LieblingsFarbe',
      },
    ],
  },
  saveNo: 146,
  created: new Date('2024-01-01T00:00:00.000Z'),
  expirationDate: new Date('2025-01-01'),
  expirationTime: '14:30',
  isAnonymous: false,
  canSubmitMultipleAnswers: false,
};

export const fourthMockSurveyDto: SurveyDto = {
  ...fourthMockSurvey,
  invitedAttendees: [],
  invitedGroups: [],
  saveNo: 1,
};
