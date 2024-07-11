import mongoose from 'mongoose';
import { Survey } from '../survey.schema';

// -------------------------
// Open Survey 01
// -------------------------
export const idOfOpenSurvey01 = new mongoose.Types.ObjectId(210);
export const openSurvey01: Survey = {
  _id: idOfOpenSurvey01,
  id: idOfOpenSurvey01,
  formula: {
    // @ts-expect-error: 'formula' has the following structure
    title: 'Open Survey 01',
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
export const idOfCreateNewOpenSurvey = new mongoose.Types.ObjectId(220);
export const createNewOpenSurvey: Survey = {
  _id: idOfCreateNewOpenSurvey,
  id: idOfCreateNewOpenSurvey,
  formula: {
    // @ts-expect-error: 'formula' has the following structure
    title: 'New Created Open Survey',
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
