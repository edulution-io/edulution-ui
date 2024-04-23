import Question from "@/pages/Survey/Editor/Questions/Question.tsx";

export interface Question {

}

export interface SurveyPage {
  index: number;
  name: string;
  description: string;
  questions: Question[];
}

export interface Survey {
  name: string;
  description: string;
  pages: SurveyPage[];
}
