import { create } from 'zustand';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import eduApi from '@/api/eduApi';
import SURVEYS_ENDPOINT, {
  SURVEY_ALL_SURVEYS_ENDPOINT,
  SURVEY_ANSWERED_SURVEYS_ENDPOINT,
  SURVEY_CREATED_SURVEYS_ENDPOINT,
  SURVEY_OPEN_SURVEYS_ENDPOINT,
} from '@libs/survey/surveys-endpoint';
import SurveysPageView from '@libs/survey/types/page-view';
import SurveyDto from '@libs/survey/types/survey.dto';
import handleApiError from '@/utils/handleApiError';

interface SurveysTablesPageStore {
  selectedPageView: SurveysPageView;
  updateSelectedPageView: (pageView: SurveysPageView) => void;
  selectedSurvey: SurveyDto | undefined;
  selectSurvey: (survey: SurveyDto | undefined) => void;

  openSurveys: SurveyDto[];
  updateOpenSurveys: () => Promise<SurveyDto[]>;
  isFetchingOpenSurveys: boolean;
  errorFetchingOpenSurveys: Error | null;

  createdSurveys: SurveyDto[];
  updateCreatedSurveys: () => Promise<SurveyDto[]>;
  isFetchingCreatedSurveys: boolean;
  errorFetchingCreatedSurveys: Error | null;

  answeredSurveys: SurveyDto[];
  updateAnsweredSurveys: () => Promise<SurveyDto[]>;
  isFetchingAnsweredSurveys: boolean;
  errorFetchingAnsweredSurveys: Error | null;

  allSurveys: SurveyDto[];
  updateAllSurveys: () => Promise<SurveyDto[]>;
  isFetchingAllSurveys: boolean;
  errorFetchingAllSurveys: Error | null;

  patchSurvey: (survey: SurveyDto) => Promise<SurveyDto>;
  isPosting: boolean;
  errorPostingSurvey: Error | null;

  reset: () => void;
}

const initialState: Partial<SurveysTablesPageStore> = {
  selectedPageView: SurveysPageView.OPEN_SURVEYS,
  selectedSurvey: undefined,

  answeredSurveys: [],
  isFetchingAnsweredSurveys: false,
  errorFetchingAnsweredSurveys: null,
  createdSurveys: [],
  isFetchingCreatedSurveys: false,
  errorFetchingCreatedSurveys: null,
  openSurveys: [],
  isFetchingOpenSurveys: false,
  errorFetchingOpenSurveys: null,
  allSurveys: [],
  isFetchingAllSurveys: false,
  errorFetchingAllSurveys: null,

  isPosting: false,
  errorPostingSurvey: null,
};

const useSurveyTablesPageStore = create<SurveysTablesPageStore>((set) => ({
  ...(initialState as SurveysTablesPageStore),
  reset: () => set(initialState),

  updateSelectedPageView: (pageView: SurveysPageView) => set({ selectedPageView: pageView }),
  selectSurvey: (survey: SurveyDto | undefined) => set({ selectedSurvey: survey }),

  updateOpenSurveys: async (): Promise<SurveyDto[]> => {
    set({ errorFetchingOpenSurveys: null, isFetchingOpenSurveys: true });
    try {
      const response = await eduApi.get<SurveyDto[]>(SURVEY_OPEN_SURVEYS_ENDPOINT);
      const surveys = response.data;
      set({ openSurveys: surveys, isFetchingOpenSurveys: false });
      return surveys;
    } catch (error) {
      set({
        openSurveys: [],
        errorFetchingOpenSurveys: error instanceof Error ? error : null,
        isFetchingOpenSurveys: false,
      });
      toast.error(
        error instanceof Error
          ? `${error.name}: ${error.message}`
          : 'Error while fetching the list of surveys, you have to answer',
      );
      handleApiError(error, set, 'errorFetchingOpenSurveys');
      return [];
    }
  },

  updateCreatedSurveys: async (): Promise<SurveyDto[]> => {
    set({ errorFetchingCreatedSurveys: null, isFetchingCreatedSurveys: true });
    try {
      const response = await eduApi.get<SurveyDto[]>(SURVEY_CREATED_SURVEYS_ENDPOINT);
      const surveys = response.data;
      set({ createdSurveys: surveys, isFetchingCreatedSurveys: false });
      return surveys;
    } catch (error) {
      set({
        createdSurveys: [],
        errorFetchingCreatedSurveys: error instanceof AxiosError ? error : null,
        isFetchingCreatedSurveys: false,
      });
      toast.error(
        error instanceof AxiosError
          ? `${error.name}: ${error.message}`
          : 'Error while fetching the list of surveys, you have created',
      );
      handleApiError(error, set, 'errorFetchingCreatedSurveys');
      return [];
    }
  },

  updateAnsweredSurveys: async (): Promise<SurveyDto[]> => {
    set({ errorFetchingAnsweredSurveys: null, isFetchingAnsweredSurveys: true });
    try {
      const response = await eduApi.get<SurveyDto[]>(SURVEY_ANSWERED_SURVEYS_ENDPOINT);
      const surveys = response.data;
      set({ answeredSurveys: surveys, isFetchingAnsweredSurveys: false });
      return surveys;
    } catch (error) {
      set({
        answeredSurveys: [],
        errorFetchingAnsweredSurveys: error instanceof AxiosError ? error : null,
        isFetchingAnsweredSurveys: false,
      });
      toast.error(
        error instanceof AxiosError
          ? `${error.name}: ${error.message}`
          : 'Error while fetching the list of surveys, you have answered, already',
      );
      handleApiError(error, set, 'errorFetchingAnsweredSurveys');
      return [];
    }
  },

  updateAllSurveys: async (): Promise<SurveyDto[]> => {
    set({ errorFetchingAllSurveys: null, isFetchingAllSurveys: true });
    try {
      const response = await eduApi.get<SurveyDto[]>(SURVEY_ALL_SURVEYS_ENDPOINT);
      const surveys = response.data;
      set({ allSurveys: surveys, isFetchingAllSurveys: false });
      return surveys;
    } catch (error) {
      set({
        allSurveys: [],
        errorFetchingAllSurveys: error instanceof AxiosError ? error : null,
        isFetchingAllSurveys: false,
      });
      toast.error(error instanceof AxiosError ? `${error.name}: ${error.message}` : 'Error while fetching all surveys');
      handleApiError(error, set, 'errorFetchingAllSurveys');
      return [];
    }
  },

  patchSurvey: async (survey: SurveyDto): Promise<SurveyDto> => {
    set({ errorPostingSurvey: null, isPosting: true });
    try {
      const response = await eduApi.post<SurveyDto>(SURVEYS_ENDPOINT, { ...survey });
      set({ isPosting: false });
      return response.data;
    } catch (error) {
      set({ errorPostingSurvey: error instanceof AxiosError ? error : null, isPosting: false });
      toast.error(
        error instanceof AxiosError ? `${error.name}: ${error.message}` : 'Error while creating/updating a survey',
      );
      handleApiError(error, set, 'errorPostingSurvey');
      throw error;
    }
  },
}));

export default useSurveyTablesPageStore;
