import mongoose from 'mongoose';
import UpdateOrCreateSurveyDto from '@libs/survey/types/update-or-create-survey.dto';
import { SurveyModel, SurveyDocument } from './survey.schema';

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

export const firstMockSurvey: UpdateOrCreateSurveyDto = {
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
  participants: mockedParticipants,
  participated: [firstUsername],
  publicAnswers: [publicAnswerForFirstMockSurvey],
  saveNo: 117,
  created: new Date('2021-06-26T00:00:00.000Z'),
  expirationDate: new Date('2021-06-26'),
  expirationTime: '12:00',
  isAnonymous: false,
  canSubmitMultipleAnswers: false,
};

export const partialUpdateOnFirstMockSurveyAfterAddedNewAnswer: Partial<SurveyModel> = {
  publicAnswers: [publicAnswerForFirstMockSurvey, addNewPublicAnswerToFirstMockSurvey],
  participated: [firstUsername, secondUsername],
};

export const firstMockSurveyAfterAddedNewAnswer: Partial<SurveyModel> = {
  ...firstMockSurvey,
  publicAnswers: [publicAnswerForFirstMockSurvey, addNewPublicAnswerToFirstMockSurvey],
  participated: [firstUsername, secondUsername],
};

export const publicAnswerForSecondMockSurvey: JSON = {
  // @ts-ignore: 'publicAnswers' has this structure
  Frage1: 'pupil2',
  Frage2: 'name2',
};

export const addNewPublicAnswerToSecondMockSurvey: JSON = {
  // @ts-ignore: 'publicAnswers' has this structure
  Frage1: 'pupil1',
  Frage2: 'name1',
};

export const addNewPublicAnswerToSecondMockSurveyFromThirdUser: JSON = {
  // @ts-ignore: 'publicAnswers' has this structure
  Frage1: 'pupil3',
  Frage2: 'name3',
};

export const secondMockSurvey: UpdateOrCreateSurveyDto = {
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
  participants: mockedParticipants,
  participated: [secondUsername],
  publicAnswers: [publicAnswerForSecondMockSurvey],
  saveNo: 2,
  created: new Date('2020-11-29T00:00:00.000Z'),
  expirationDate: new Date('2025-04-22'),
  expirationTime: '14:30',
  isAnonymous: false,
  canSubmitMultipleAnswers: false,
};

export const partialUpdateOnSecondMockSurveyAfterAddedNewAnswer: Partial<UpdateOrCreateSurveyDto> = {
  participated: [secondUsername, thirdUsername],
  publicAnswers: [publicAnswerForSecondMockSurvey, addNewPublicAnswerToSecondMockSurveyFromThirdUser],
};

export const secondMockSurveyAfterAddedNewAnswer: Partial<UpdateOrCreateSurveyDto> = {
  ...firstMockSurvey,
  participated: [secondUsername, thirdUsername],
  publicAnswers: [publicAnswerForSecondMockSurvey, addNewPublicAnswerToSecondMockSurveyFromThirdUser],
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

export const mockSurveys: UpdateOrCreateSurveyDto[] = [firstMockSurvey, secondMockSurvey];

export const thirdMockSurveyAddNewPublicAnswer: JSON = {
  // @ts-ignore: 'publicAnswers' has this structure
  Frage1: 'Lasagne',
};

export const thirdMockSurvey: UpdateOrCreateSurveyDto = {
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
  participants: mockedParticipants,
  participated: [],
  publicAnswers: [],
  saveNo: 2,
  created: new Date('2020-11-29T00:00:00.000Z'),
  expirationDate: new Date('2025-04-22'),
  expirationTime: '14:30',
  isAnonymous: false,
  canSubmitMultipleAnswers: false,
};

export const thirdMockSurveyAfterAddedNewAnswer: Partial<UpdateOrCreateSurveyDto> = {
  ...thirdMockSurvey,
  publicAnswers: [thirdMockSurveyAddNewPublicAnswer],
  participated: [firstUsername],
};

export const fourthMockSurvey: UpdateOrCreateSurveyDto = {
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
  participants: mockedParticipants,
  participated: [],
  publicAnswers: [],
  saveNo: 146,
  created: new Date('2024-01-01T00:00:00.000Z'),
  expirationDate: new Date('2025-01-01'),
  expirationTime: '14:30',
  isAnonymous: false,
  canSubmitMultipleAnswers: false,
};
