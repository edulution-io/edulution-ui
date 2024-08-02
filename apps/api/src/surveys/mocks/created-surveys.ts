import mongoose from 'mongoose';
import { Survey } from '../survey.schema';

// -------------------------
// Created Survey 01
// -------------------------
export const idOfCreatedSurvey01 = new mongoose.Types.ObjectId(110);
export const createdSurvey01: Survey = {
  _id: idOfCreatedSurvey01,
  id: idOfCreatedSurvey01,
  formula: {
    // @ts-expect-error: 'formula' has the following structure
    title: 'Created Survey 01',
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
  created: new Date('2021-06-26T00:00:00.000Z'),
  expirationDate: new Date('2044-08-22'),
  expirationTime: '12:00',
  isAnonymous: false,
  canSubmitMultipleAnswers: false,
};

// -------------------------
// Create New
// -------------------------
export const idOfCreateNewCreatedSurvey = new mongoose.Types.ObjectId(120);
export const createNewCreatedSurvey: Survey = {
  _id: idOfCreateNewCreatedSurvey,
  id: idOfCreateNewCreatedSurvey,
  formula: {
    // @ts-expect-error: 'formula' has the following structure
    title: 'New Create Created Survey',
    description: 'This is a test survey',
    elements: [
      {
        type: 'rating',
        name: 'Frage1',
        title: 'How likely is it, that you will recommend this product to a friend?',
      },
    ],
  },
  saveNo: 12,
  created: new Date('2021-06-26T00:00:00.000Z'),
  expirationDate: new Date('2044-08-22'),
  expirationTime: '12:00',
  isAnonymous: false,
  canSubmitMultipleAnswers: false,
};
