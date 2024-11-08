import isSurveyPage from '@libs/survey/utils/isSurveyPage';
import TSurveyFormula from '@libs/survey/types/TSurveyFormula';
import isSurveyElement from '@libs/survey/utils/isSurveyElement';

const isSurveyFormula = (surveyFormula: TSurveyFormula): boolean => {
  // TODO: NIEDUUI-209: Add validation to make the Title mandatory
  const { /* title, */ pages, elements } = surveyFormula;
  if (pages) {
    return pages.every(isSurveyPage);
  }

  return elements ? elements.every(isSurveyElement) : false;
};

export default isSurveyFormula;
