import SurveyDto from '@libs/survey/types/api/survey.dto';

interface SurveysTablesPageStore {
  selectedSurvey: SurveyDto | undefined;
  selectSurvey: (survey: SurveyDto | undefined) => void;

  updateSelectedSurvey: (surveyId: string | undefined, isPublic: boolean) => Promise<void>;
  isFetching: boolean;

  canParticipateSelectedSurvey: () => Promise<void>;
  canParticipate: boolean;

  updateUsersSurveys: () => Promise<void>;

  openSurveys: SurveyDto[];
  updateOpenSurveys: () => Promise<void>;
  isFetchingOpenSurveys: boolean;

  createdSurveys: SurveyDto[];
  updateCreatedSurveys: () => Promise<void>;
  isFetchingCreatedSurveys: boolean;

  answeredSurveys: SurveyDto[];
  updateAnsweredSurveys: () => Promise<void>;
  isFetchingAnsweredSurveys: boolean;

  reset: () => void;
}

export default SurveysTablesPageStore;
