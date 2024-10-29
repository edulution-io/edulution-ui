import TSurveyPage from '@libs/survey/types/TSurveyPage';
import isSurveyElement from '@libs/survey/utils/isSurveyElement';

const isSurveyPage = (surveyFormula: TSurveyPage): boolean => {
  const { name, elements } = surveyFormula;

  if (!name) return false;

  if (!elements) return false;

  const areAllTheElementsStructured = elements.map((element) => isSurveyElement(element));
  const unstructuredElement = areAllTheElementsStructured.find((state) => !state);
  return !unstructuredElement;
};

export default isSurveyPage;
