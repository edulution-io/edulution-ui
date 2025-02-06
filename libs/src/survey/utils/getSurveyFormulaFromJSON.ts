import { t } from 'i18next';
import SurveyFormula from '@libs/survey/types/TSurveyFormula';
import SurveyErrorMessages from '@libs/survey/constants/survey-error-messages';
import { toast } from 'sonner';
import isSurveyPage from '@libs/survey/utils/isSurveyPage';
import isSurveyElement from '@libs/survey/utils/isSurveyElement';

const isValidSurveyFormula = (surveyFormula: SurveyFormula): boolean => {
  const { title, pages, elements } = surveyFormula;
  if (pages) {
    return pages.every(isSurveyPage);
  }
  if (elements) {
    return elements.every(isSurveyElement);
  }
  return !!title;
};

const getSurveyFormulaFromJSON = (formula: JSON): SurveyFormula => {
  try {
    const typedFormula = formula as unknown as SurveyFormula;

    const isValidFormula = isValidSurveyFormula(typedFormula);
    if (isValidFormula) {
      return typedFormula;
    }
  } catch (error) {
    toast.error(t(SurveyErrorMessages.SurveyFormulaStructuralError));
  }

  return { title: t('survey.newTitle').toString() };
};

export default getSurveyFormulaFromJSON;
