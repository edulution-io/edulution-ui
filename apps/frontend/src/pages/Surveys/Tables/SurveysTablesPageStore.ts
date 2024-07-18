import { create } from 'zustand';
import { AxiosError } from 'axios';
import eduApi from '@/api/eduApi';
import SURVEYS_ENDPOINT from '@libs/survey/surveys-endpoint';
import SurveyDto from '@libs/survey/types/survey.dto';
import SurveysPageView from '@libs/survey/types/page-view';
import SurveyStatus from '@libs/survey/types/survey-status-enum';
import handleApiError from '@/utils/handleApiError';

interface SurveysTablesPageStore {
  selectedPageView: SurveysPageView;
  updateSelectedPageView: (pageView: SurveysPageView) => void;
  selectedSurvey: SurveyDto | undefined;
  selectSurvey: (survey: SurveyDto | undefined) => void;

  updateUsersSurveys: () => Promise<void>;

  openSurveys: SurveyDto[];
  updateOpenSurveys: () => Promise<void>;
  isFetchingOpenSurveys: boolean;
  errorFetchingOpenSurveys: Error | null;

  createdSurveys: SurveyDto[];
  updateCreatedSurveys: () => Promise<void>;
  isFetchingCreatedSurveys: boolean;
  errorFetchingCreatedSurveys: Error | null;

  answeredSurveys: SurveyDto[];
  updateAnsweredSurveys: () => Promise<void>;
  isFetchingAnsweredSurveys: boolean;
  errorFetchingAnsweredSurveys: Error | null;

  patchSurvey: (survey: SurveyDto) => Promise<SurveyDto>;
  isPosting: boolean;
  errorPostingSurvey: Error | null;

  reset: () => void;
}

const initialState: Partial<SurveysTablesPageStore> = {
  selectedPageView: SurveysPageView.OPEN,
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

  isPosting: false,
  errorPostingSurvey: null,
};

const useSurveyTablesPageStore = create<SurveysTablesPageStore>((set, get) => ({
  ...(initialState as SurveysTablesPageStore),
  reset: () => set(initialState),

  updateSelectedPageView: (pageView: SurveysPageView) => set({ selectedPageView: pageView }),
  selectSurvey: (survey: SurveyDto | undefined) => set({ selectedSurvey: survey }),
  updateUsersSurveys: async (): Promise<void> => {
    const { updateOpenSurveys, updateCreatedSurveys, updateAnsweredSurveys } = get();
    const promises = [updateOpenSurveys(), updateCreatedSurveys(), updateAnsweredSurveys()];
    await Promise.all(promises);
  },

  updateOpenSurveys: async (): Promise<void> => {
    set({ errorFetchingOpenSurveys: null, isFetchingOpenSurveys: true });
    try {
      const response = await eduApi.get<SurveyDto[]>(SURVEYS_ENDPOINT, { params: { status: SurveyStatus.OPEN } });
      const surveys = response.data;
      set({ openSurveys: surveys, isFetchingOpenSurveys: false });
    } catch (error) {
      set({
        openSurveys: [],
        errorFetchingOpenSurveys: error instanceof Error ? error : null,
        isFetchingOpenSurveys: false,
      });
      handleApiError(error, set, 'errorFetchingOpenSurveys');
    }
  },

  updateCreatedSurveys: async (): Promise<void> => {
    set({ errorFetchingCreatedSurveys: null, isFetchingCreatedSurveys: true });
    try {
      const response = await eduApi.get<SurveyDto[]>(SURVEYS_ENDPOINT, { params: { status: SurveyStatus.CREATED } });
      const surveys = response.data;
      set({ createdSurveys: surveys, isFetchingCreatedSurveys: false });
    } catch (error) {
      set({
        createdSurveys: [],
        errorFetchingCreatedSurveys: error instanceof AxiosError ? error : null,
        isFetchingCreatedSurveys: false,
      });
      handleApiError(error, set, 'errorFetchingCreatedSurveys');
    }
  },

  updateAnsweredSurveys: async (): Promise<void> => {
    set({ errorFetchingAnsweredSurveys: null, isFetchingAnsweredSurveys: true });
    try {
      const response = await eduApi.get<SurveyDto[]>(SURVEYS_ENDPOINT, { params: { status: SurveyStatus.ANSWERED } });
      const surveys = response.data;
      set({ answeredSurveys: surveys, isFetchingAnsweredSurveys: false });
    } catch (error) {
      set({
        answeredSurveys: [],
        errorFetchingAnsweredSurveys: error instanceof AxiosError ? error : null,
        isFetchingAnsweredSurveys: false,
      });
      handleApiError(error, set, 'errorFetchingAnsweredSurveys');
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
      handleApiError(error, set, 'errorPostingSurvey');
      throw error;
    }
  },
}));

export default useSurveyTablesPageStore;
