import SurveyDto from '@libs/survey/types/api/survey.dto';

interface SurveyEditorFormStore {
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
