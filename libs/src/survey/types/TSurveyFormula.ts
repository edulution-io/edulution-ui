import SurveyPage from '@libs/survey/types/TSurveyPage';
import SurveyElement from '@libs/survey/types/TSurveyElement';

class SurveyFormula {
  title: string;

  description?: string;

  // only defined in page mode
  pages?: SurveyPage[];

  // only defined in page-less mode
  elements?: SurveyElement[];
}

export default SurveyFormula;
