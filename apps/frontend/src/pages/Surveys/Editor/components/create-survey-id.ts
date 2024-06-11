export const createSurveyId = () => {
  const currentDate = new Date();
  const randomInt = Math.floor(Math.random() * 1000000000);
  const str = `${currentDate.getFullYear()}${currentDate.getMonth()}${currentDate.getDay()}${currentDate.getHours()}${currentDate.getMinutes()}${currentDate.getSeconds()}${randomInt}`;
  return parseInt(str);
};
