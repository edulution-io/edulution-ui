import sortString from '@libs/common/utils/sortString';
import convertJSONToSurveyFormula from '@libs/survey/utils/convertJSONToSurveyFormula';

interface ObjectWithFormula {
  formula: JSON;
}

function sortSurveyByTitle<T extends ObjectWithFormula>(a: T, b: T): number {
  const surveyFormulaA = convertJSONToSurveyFormula(a.formula);
  const surveyFormulaB = convertJSONToSurveyFormula(b.formula);
  return sortString(surveyFormulaA?.title, surveyFormulaB?.title);
}

export default sortSurveyByTitle;
