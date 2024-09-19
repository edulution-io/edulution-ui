import { Question } from 'survey-core/typings/question';
import SurveyDto from '@libs/survey/types/api/survey.dto';

interface SurveyEditorFormStore {
  selectedQuestion: Question | undefined;
  setSelectedQuestion: (question: Question | undefined) => void;
  isOpenQuestionSettingsDialog: boolean;
  setIsOpenQuestionSettingsDialog: (state: boolean) => void;

  isOpenSaveSurveyDialog: boolean;
  setIsOpenSaveSurveyDialog: (state: boolean) => void;
  updateOrCreateSurvey: (survey: SurveyDto) => Promise<void>;
  isLoading: boolean;

  isOpenSharePublicSurveyDialog: boolean;
  publicSurveyId: string;
  closeSharePublicSurveyDialog: () => void;

  reset: () => void;
}

export default SurveyEditorFormStore;
