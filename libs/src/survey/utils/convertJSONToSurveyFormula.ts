import SurveyFormulaDto from '@libs/survey/types/surveyFormula.dto';

const convertJSONToSurveyFormula = (formula: JSON): SurveyFormulaDto | undefined => {
  try {
    return formula as unknown as SurveyFormulaDto;
  } catch (error) {
    return undefined;
  }
};

export default convertJSONToSurveyFormula;
