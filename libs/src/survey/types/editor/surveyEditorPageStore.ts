import SurveyDto from '@libs/survey/types/api/survey.dto';

interface SurveyEditorPageStore {
  survey: SurveyDto | undefined;
  setSurvey: (survey: SurveyDto | undefined) => void;

  isOpenSaveSurveyDialog: boolean;
  setIsOpenSaveSurveyDialog: (state: boolean) => void;
  updateOrCreateSurvey: (survey: SurveyDto) => Promise<void>;
  isLoading: boolean;

  isOpenSharePublicSurveyDialog: boolean;
  publicSurveyId: string;
  closeSharePublicSurveyDialog: () => void;

  reset: () => void;
}

export default SurveyEditorPageStore;
