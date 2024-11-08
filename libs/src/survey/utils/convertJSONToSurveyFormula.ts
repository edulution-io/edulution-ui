import { t } from 'i18next';
import SurveyFormula from '@libs/survey/types/TSurveyFormula';
import isSurveyFormula from '@libs/survey/utils/isSurveyFormula';
import SurveyErrorMessages from '@libs/survey/constants/survey-error-messages';
import { toast } from 'sonner';

const convertJSONToSurveyFormula = (formula: JSON): SurveyFormula | undefined => {
  try {
    const typedFormula = formula as unknown as SurveyFormula;

    const isValidFormula = isSurveyFormula(typedFormula);
    if (isValidFormula) {
      return typedFormula;
    }

    return undefined;
  } catch (error) {
    toast.error(t(SurveyErrorMessages.SurveyFormulaStructuralError));
    throw new Error(t(SurveyErrorMessages.SurveyFormulaStructuralError));
  }
};

export default convertJSONToSurveyFormula;
