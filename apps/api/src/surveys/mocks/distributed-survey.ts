import mongoose from 'mongoose';
import { Survey } from '../survey.schema';
import { firstUsername } from './usernames';

export const idOfDistributedSurvey = new mongoose.Types.ObjectId(400);
export const distributedSurvey: Survey = {
  _id: idOfDistributedSurvey,
  id: idOfDistributedSurvey,
  formula: {
    // @ts-expect-error: 'formula' has the following structure
    title: 'Distributed Survey',
    description: 'This is a test survey',
    elements: [
      {
        type: 'text',
        name: 'Frage1',
        title: 'FavouriteColor/LieblingsFarbe',
      },
    ],
  },
  saveNo: 1,
  created: new Date('2024-01-01T00:00:00.000Z'),
  expirationDate: new Date('2025-01-01'),
  expirationTime: '14:30',
  isAnonymous: false,
  canSubmitMultipleAnswers: false,
};
export const idOfAnswerFromFirstUserForDistributedSurvey = new mongoose.Types.ObjectId(401);
export const answerFromFirstUserForDistributedSurvey = {
  _id: idOfAnswerFromFirstUserForDistributedSurvey,
  id: idOfAnswerFromFirstUserForDistributedSurvey,
  survey: distributedSurvey,
  user: firstUsername,
  answer: {} as JSON,
};
