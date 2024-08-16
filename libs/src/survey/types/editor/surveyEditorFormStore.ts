import SurveyDto from '@libs/survey/types/api/survey.dto';

interface SurveyEditorFormStore {
  isOpenSaveSurveyDialog: boolean;
  setIsOpenSaveSurveyDialog: (state: boolean) => void;
  updateOrCreateSurvey: (survey: SurveyDto) => Promise<void>;
  isLoading: boolean;
  reset: () => void;
}

export default SurveyEditorFormStore;
