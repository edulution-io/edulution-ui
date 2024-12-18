import TSurveyPage from '@libs/survey/types/TSurveyPage';
import isSurveyElement from '@libs/survey/utils/isSurveyElement';

const isSurveyPage = (surveyFormula: TSurveyPage): boolean => {
  const { name, elements } = surveyFormula;

  if (!name || !elements) return false;

  return elements.every(isSurveyElement);
};

export default isSurveyPage;
