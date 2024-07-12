import mongoose from 'mongoose';
import { Survey } from '../survey.schema';
import { firstUsername } from './usernames';

export const mockedAnswerForOpenSurvey: JSON = JSON.parse('{ "Frage1": "7" }') as JSON;

export const idOfTheOpenSurvey = new mongoose.Types.ObjectId(200);
export const theOpenSurvey: Survey = {
  _id: idOfTheOpenSurvey,
  id: idOfTheOpenSurvey,
  formula: {
    // @ts-expect-error: 'formula' has the following structure
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
  saveNo: 1,
  created: new Date('2021-06-26T00:00:00.000Z'),
  expirationDate: new Date('2044-08-22'),
  expirationTime: '12:00',
  isAnonymous: false,
  canSubmitMultipleAnswers: false,
};
export const idOfAnswerFromFirstUserToAnswerTheOpenSurvey = new mongoose.Types.ObjectId(111);
export const answerFromFirstUserToAnswerTheOpenSurvey = {
  _id: idOfAnswerFromFirstUserToAnswerTheOpenSurvey,
  id: idOfAnswerFromFirstUserToAnswerTheOpenSurvey,
  survey: idOfTheOpenSurvey,
  saveNo: 1,
  user: firstUsername,
  answer: mockedAnswerForOpenSurvey,
};
