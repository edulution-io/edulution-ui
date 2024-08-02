import mongoose from 'mongoose';
import { Survey } from '../survey.schema';
import { firstUsername } from './usernames';

export const mockedAnswerForAnsweredSurveys: JSON = JSON.parse('{"Frage1": "Antwort1"}') as JSON;

// -------------------------
// Answered Survey 01
// -------------------------
export const idOfAnsweredSurvey01 = new mongoose.Types.ObjectId(310);
export const answeredSurvey01: Survey = {
  _id: idOfAnsweredSurvey01,
  id: idOfAnsweredSurvey01,
  formula: {
    // @ts-expect-error: 'formula' has the following structure
    title: 'Answered Survey 01',
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
export const idOfAnswerFromFirstUserForAnsweredSurvey01 = new mongoose.Types.ObjectId(311);
export const answerFromFirstUserForAnsweredSurvey01 = {
  _id: idOfAnswerFromFirstUserForAnsweredSurvey01,
  id: idOfAnswerFromFirstUserForAnsweredSurvey01,
  survey: idOfAnsweredSurvey01,
  saveNo: 117,
  user: firstUsername,
  answer: mockedAnswerForAnsweredSurveys,
};

// -------------------------
// Answered Survey 02
// -------------------------
export const idOfAnsweredSurvey02 = new mongoose.Types.ObjectId(320);
export const answeredSurvey02: Survey = {
  _id: idOfAnsweredSurvey02,
  id: idOfAnsweredSurvey02,
  formula: {
    // @ts-expect-error: 'formula' has the following structure
    title: 'Answered Survey 02',
    description: 'This is a page-less test survey',
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
  saveNo: 1,
  created: new Date('2020-11-29T00:00:00.000Z'),
  expirationDate: new Date('2025-04-22'),
  expirationTime: '14:30',
  isAnonymous: false,
  canSubmitMultipleAnswers: false,
};
export const idOfAnswerFromFirstUserForAnsweredSurvey02 = new mongoose.Types.ObjectId(321);
export const answerFromFirstUserForAnsweredSurvey02 = {
  _id: idOfAnswerFromFirstUserForAnsweredSurvey02,
  id: idOfAnswerFromFirstUserForAnsweredSurvey02,
  survey: idOfAnsweredSurvey02,
  saveNo: 1,
  user: firstUsername,
  answer: {} as JSON,
};
