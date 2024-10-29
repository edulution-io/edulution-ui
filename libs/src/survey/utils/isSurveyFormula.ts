import isSurveyPage from '@libs/survey/utils/isSurveyPage';
import TSurveyFormula from '@libs/survey/types/TSurveyFormula';
import isSurveyElement from '@libs/survey/utils/isSurveyElement';

const isSurveyFormula = (surveyFormula: TSurveyFormula): boolean => {
  // TODO: NIEDUUI-209: Add validation to make the Title mandatory
  const { /* title, */ pages, elements } = surveyFormula;
  // if (!title) return false;
  if (pages) {
    const pagesAreStructured = pages.map((page) => isSurveyPage(page));
    const unStructuredPage = pagesAreStructured.find((state) => !state);
    if (unStructuredPage) return false;
  } else {
    if (!elements) return false;
    const pageLessIsStructured = elements.map((element) => isSurveyElement(element));
    const unStructuredElement = pageLessIsStructured.find((state) => !state);
    if (unStructuredElement) return false;
  }
  return true;
};

export default isSurveyFormula;
