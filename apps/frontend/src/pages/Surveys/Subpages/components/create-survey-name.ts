import { v4 as uuidv4 } from 'uuid';

export const createSurveyName = () => {
  const currentDate = new Date();
  const id = uuidv4();
  return `${currentDate.getFullYear()}${currentDate.getMonth()}${currentDate.getDay()}${currentDate.getHours()}${currentDate.getMinutes()}${currentDate.getSeconds()}${id}`;
};
