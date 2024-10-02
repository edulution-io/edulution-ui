interface SurveyFormulaDto {
  title: string;
  description: string;
  pages?: SurveyFormulaDto[];
  elements?: SurveyFormulaDto[];
}

export default SurveyFormulaDto;
