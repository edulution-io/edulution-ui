import TSurveyElement from '@libs/survey/types/TSurveyElement';

const isSurveyElement = (element: TSurveyElement): boolean => {
  const { name, type } = element;
  return Boolean(name && type);
};

export default isSurveyElement;
