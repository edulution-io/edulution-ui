import { Survey, SurveyDocument } from './types/survey.schema';

export const first_username = 'pupil1-name1';

export const second_username = 'pupil2-name2';

export const mocked_participants = [
  {
    username: first_username,
    lastName: 'name1',
    firstName: 'pupil1',
  },
  {
    username: second_username,
    lastName: 'name2',
    firstName: 'pupil2',
  },
];

export const id_FirstMockSurvey: number = 1;

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

export const firstMockSurvey: Survey = {
  id: id_FirstMockSurvey,
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
            choices: [
              'Item 1',
              'Item 2',
              'Item 3'
            ]
          },
          {
            type: 'text',
            name: 'Frage2',
            title: 'text-input'
          },
        ]
      }
    ]
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

export const partial_firstMockSurvey_afterAddedNewAnswer: Partial<Survey> = {
  publicAnswers: [publicAnswer_FirstMockSurvey, addNewPublicAnswer_FirstMockSurvey],
  participated: [first_username, second_username],
};

export const firstMockSurvey_afterAddedNewAnswer: Partial<Survey> = {
  ...firstMockSurvey,
  publicAnswers: [publicAnswer_FirstMockSurvey, addNewPublicAnswer_FirstMockSurvey],
  participated: [first_username, second_username],
};

export const firstMockSurveyDocument: SurveyDocument = {
  ...firstMockSurvey,
  _id: '60d6c47e4094a113f0d0fe03',
  save: jest.fn().mockResolvedValue(firstMockSurvey),
  remove: jest.fn().mockResolvedValue(firstMockSurvey),
} as unknown as SurveyDocument;

export const id_SecondMockSurvey: number = 2;

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

export const secondMockSurvey: Survey = {
  id: id_SecondMockSurvey,
  formula: {
    // @ts-ignore: 'formula' has the following structure
    title: 'Second Survey',
    description: 'This is a test survey (page-less)',
    elements: [
      {
        type: 'text',
        name: 'Frage1',
        title: 'Firstname/Vorname'
      },
      {
        type: 'text',
        name: 'Frage2',
        title: 'Lastname/Nachname'
      },
    ]
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

export const partial_secondMockSurvey_afterAddedNewAnswer: Partial<Survey> = {
  participated: [second_username, first_username],
  publicAnswers: [publicAnswer_SecondMockSurvey, addNewPublicAnswer_SecondMockSurvey],
};

export const secondMockSurvey_afterAddedNewAnswer: Partial<Survey> = {
  ...firstMockSurvey,
  participated: [second_username, first_username],
  publicAnswers: [publicAnswer_SecondMockSurvey, addNewPublicAnswer_SecondMockSurvey],
};

export const secondMockSurveyDocument: SurveyDocument = {
  ...secondMockSurvey,
  _id: '21d2c68e095a3547f8d6fe24',
  save: jest.fn().mockResolvedValue(secondMockSurvey),
  remove: jest.fn().mockResolvedValue(secondMockSurvey),
} as unknown as SurveyDocument;

export const ids_MockSurveys: number[] = [id_FirstMockSurvey, id_SecondMockSurvey];

export const mockSurveys: Survey[] = [firstMockSurvey, secondMockSurvey];

export const mockSurveyDocuments: SurveyDocument[] = [firstMockSurveyDocument, secondMockSurveyDocument];
