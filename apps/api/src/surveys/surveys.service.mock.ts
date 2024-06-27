/* eslint-disable */

import mongoose from 'mongoose';
import { SurveyModel, SurveyDocument } from './survey.schema';

export const newObjectId = new mongoose.Types.ObjectId(52653415245934);

export const id_FirstMockSurvey: mongoose.Types.ObjectId = new mongoose.Types.ObjectId(1);

export const id_SecondMockSurvey: mongoose.Types.ObjectId = new mongoose.Types.ObjectId(2);

export const id_ThirdMockSurvey: mongoose.Types.ObjectId = new mongoose.Types.ObjectId(3);

export const id_FourthMockSurvey: mongoose.Types.ObjectId = new mongoose.Types.ObjectId(4);

export const first_username = 'pupil1-name1';

export const second_username = 'pupil2-name2';

export const third_username = 'pupil3-name3';

export const mocked_participants = [
  {
    username: first_username,
    lastName: 'name1',
    firstName: 'pupil1',
    label: 'pupil1-name1',
    value: first_username,
  },
  {
    username: second_username,
    lastName: 'name2',
    firstName: 'pupil2',
    label: 'pupil2-name2',
    value: second_username,
  },
  {
    username: third_username,
    lastName: 'name3',
    firstName: 'pupil3',
    label: 'pupil3-name3',
    value: third_username,
  },
];

export const privateAnswer_FirstMockSurvey: JSON = {
  // @ts-ignore: 'publicAnswers' has this structure
  Frage1: ['Item 3'],
  Frage2: 'this is a private mocked test appended to the user',
};

export const publicAnswer_FirstMockSurvey: JSON = {
  // @ts-ignore: 'publicAnswers' has this structure
  Frage1: ['Item 1'],
  Frage2: 'this is a mocked text input',
};

export const addNewPublicAnswer_FirstMockSurvey: JSON = {
  // @ts-ignore: 'publicAnswers' has this structure
  Frage1: ['Item 2'],
  Frage2: 'this is a second answer that will be added to the public answers of the survey',
};

export const addNewPublicAnswer_FirstMockSurvey_thirdUser: JSON = {
  // @ts-ignore: 'publicAnswers' has this structure
  Frage1: ['Item 3'],
  Frage2: 'this is a new answer',
};

export const firstMockSurvey: SurveyModel = {
  _id: id_FirstMockSurvey,
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
  participants: mocked_participants,
  participated: [first_username],
  publicAnswers: [publicAnswer_FirstMockSurvey],
  saveNo: 117,
  created: new Date('2021-06-26T00:00:00.000Z'),
  expirationDate: new Date('2021-06-26'),
  expirationTime: '12:00',
  isAnonymous: false,
  canSubmitMultipleAnswers: false,
};

export const partial_firstMockSurvey_afterAddedNewAnswer: Partial<SurveyModel> = {
  publicAnswers: [publicAnswer_FirstMockSurvey, addNewPublicAnswer_FirstMockSurvey],
  participated: [first_username, second_username],
};

export const firstMockSurvey_afterAddedNewAnswer: Partial<SurveyModel> = {
  ...firstMockSurvey,
  publicAnswers: [publicAnswer_FirstMockSurvey, addNewPublicAnswer_FirstMockSurvey],
  participated: [first_username, second_username],
};

export const firstMockSurveyDocument: SurveyDocument = {
  ...firstMockSurvey,
  create: jest.fn().mockResolvedValue(firstMockSurvey),
  find: jest.fn().mockResolvedValue(firstMockSurvey),
  save: jest.fn().mockResolvedValue(firstMockSurvey),
  remove: jest.fn().mockResolvedValue(firstMockSurvey),
} as unknown as SurveyDocument;

export const publicAnswer_SecondMockSurvey: JSON = {
  // @ts-ignore: 'publicAnswers' has this structure
  Frage1: 'pupil2',
  Frage2: 'name2',
};

export const addNewPublicAnswer_SecondMockSurvey: JSON = {
  // @ts-ignore: 'publicAnswers' has this structure
  Frage1: 'pupil1',
  Frage2: 'name1',
};

export const addNewPublicAnswer_SecondMockSurvey_thirdUser: JSON = {
  // @ts-ignore: 'publicAnswers' has this structure
  Frage1: 'pupil3',
  Frage2: 'name3',
};

export const secondMockSurvey: SurveyModel = {
  _id: id_SecondMockSurvey,
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
  participants: mocked_participants,
  participated: [second_username],
  publicAnswers: [publicAnswer_SecondMockSurvey],
  saveNo: 2,
  created: new Date('2020-11-29T00:00:00.000Z'),
  expirationDate: new Date('2025-04-22'),
  expirationTime: '14:30',
  isAnonymous: false,
  canSubmitMultipleAnswers: false,
};

export const partial_secondMockSurvey_afterAddedNewAnswer: Partial<SurveyModel> = {
  participated: [second_username, third_username],
  publicAnswers: [publicAnswer_SecondMockSurvey, addNewPublicAnswer_SecondMockSurvey_thirdUser],
};

export const secondMockSurvey_afterAddedNewAnswer: Partial<SurveyModel> = {
  ...firstMockSurvey,
  participated: [second_username, third_username],
  publicAnswers: [publicAnswer_SecondMockSurvey, addNewPublicAnswer_SecondMockSurvey_thirdUser],
};

export const secondMockSurveyDocument: SurveyDocument = {
  ...secondMockSurvey,
  create: jest.fn().mockResolvedValue(secondMockSurvey),
  find: jest.fn().mockResolvedValue(secondMockSurvey),
  save: jest.fn().mockResolvedValue(secondMockSurvey),
  remove: jest.fn().mockResolvedValue(secondMockSurvey),
} as unknown as SurveyDocument;

export const ids_MockSurveys: mongoose.Types.ObjectId[] = [id_FirstMockSurvey, id_SecondMockSurvey];

export const mockSurveys: SurveyModel[] = [firstMockSurvey, secondMockSurvey];

export const mockSurveyDocuments: SurveyDocument[] = [firstMockSurveyDocument, secondMockSurveyDocument];

export const addNewPublicAnswer_ThirdMockSurvey: JSON = {
  // @ts-ignore: 'publicAnswers' has this structure
  Frage1: 'Lasagne',
};

export const thirdMockSurvey: SurveyModel = {
  _id: id_ThirdMockSurvey,
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
  participants: mocked_participants,
  participated: [],
  publicAnswers: [],
  saveNo: 2,
  created: new Date('2020-11-29T00:00:00.000Z'),
  expirationDate: new Date('2025-04-22'),
  expirationTime: '14:30',
  isAnonymous: false,
  canSubmitMultipleAnswers: false,
};

export const thirdMockSurvey_afterAddedNewAnswer: Partial<SurveyModel> = {
  ...thirdMockSurvey,
  publicAnswers: [addNewPublicAnswer_ThirdMockSurvey],
  participated: [first_username],
};

export const fourthMockSurvey: SurveyModel = {
  _id: id_FourthMockSurvey,
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
  participants: mocked_participants,
  participated: [],
  publicAnswers: [],
  saveNo: 146,
  created: new Date('2024-01-01T00:00:00.000Z'),
  expirationDate: new Date('2025-01-01'),
  expirationTime: '14:30',
  isAnonymous: false,
  canSubmitMultipleAnswers: false,
};
