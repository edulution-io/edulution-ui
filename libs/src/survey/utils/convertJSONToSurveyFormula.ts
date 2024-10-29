import SurveyFormula from '@libs/survey/types/TSurveyFormula';
import isSurveyFormula from '@libs/survey/utils/isSurveyFormula';

const convertJSONToSurveyFormula = (formula: JSON): SurveyFormula | undefined => {
  try {
    // const parsedFormula = JSON.parse(JSON.stringify(formula)) as SurveyFormula;
    const parsedFormula = formula as unknown as SurveyFormula;

    const isValidFormula = isSurveyFormula(parsedFormula);
    if (isValidFormula) {
      return parsedFormula;
    }

    return undefined;
  } catch (error) {
    return undefined;
  }
};

export default convertJSONToSurveyFormula;
