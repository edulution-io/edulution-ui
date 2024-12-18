interface SurveyElement {
  type: string;
  name: string;
  title?: string;
  description?: string;
  choicesOrder?: string;
  choices?: string[];
  choicesByUrl?: {
    url: string;
  };
  showOtherItem?: boolean;
  showNoneItem?: boolean;
}

export default SurveyElement;
