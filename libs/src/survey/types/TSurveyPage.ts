import SurveyElement from '@libs/survey/types/TSurveyElement';

interface SurveyPage {
  name: string;
  description?: string;
  elements?: SurveyElement[];
}

export default SurveyPage;
