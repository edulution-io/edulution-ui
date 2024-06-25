import { create } from 'zustand';
import { AxiosError } from 'axios';
import eduApi from '@/api/eduApi';
import SURVEYS_ENDPOINT, {
  SURVEY_All_SURVEYS_ENDPOINT,
  SURVEY_ANSWERED_SURVEYS_ENDPOINT,
  SURVEY_CREATED_SURVEYS_ENDPOINT,
  SURVEY_OPEN_SURVEYS_ENDPOINT,
} from '@libs/survey/surveys-endpoint';
import SurveysPageView from '@libs/survey/types/page-view';
import Survey from '@libs/survey/types/survey';

interface SurveysTablesPageStore {
  selectedPageView: SurveysPageView;
  updateSelectedPageView: (pageView: SurveysPageView) => void;
  selectedSurvey: Survey | undefined;
  selectSurvey: (survey: Survey | undefined) => void;

  openSurveys: Survey[];
  updateOpenSurveys: () => Promise<Survey[]>;
  isFetchingOpenSurveys: boolean;
  errorFetchingOpenSurveys: Error | null;

  createdSurveys: Survey[];
  updateCreatedSurveys: () => Promise<Survey[]>;
  isFetchingCreatedSurveys: boolean;
  errorFetchingCreatedSurveys: Error | null;

  answeredSurveys: Survey[];
  updateAnsweredSurveys: () => Promise<Survey[]>;
  isFetchingAnsweredSurveys: boolean;
  errorFetchingAnsweredSurveys: Error | null;

  allSurveys: Survey[];
  updateAllSurveys: () => Promise<Survey[]>;
  isFetchingAllSurveys: boolean;
  errorFetchingAllSurveys: Error | null;

  patchSurvey: (survey: Survey) => Promise<Survey>;
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
  selectSurvey: (survey: Survey | undefined) => set({ selectedSurvey: survey }),

  updateOpenSurveys: async (): Promise<Survey[]> => {
    set({ errorFetchingOpenSurveys: null, isFetchingOpenSurveys: true });
    try {
      const response = await eduApi.get<Survey[]>(SURVEY_OPEN_SURVEYS_ENDPOINT);
      const surveys = response.data;
      set({ openSurveys: surveys, isFetchingOpenSurveys: false });
      return surveys;
    } catch (error) {
      set({ errorFetchingOpenSurveys: error as AxiosError, isFetchingOpenSurveys: false });
      return [];
    }
  },

  updateCreatedSurveys: async (): Promise<Survey[]> => {
    set({ errorFetchingCreatedSurveys: null, isFetchingCreatedSurveys: true });
    try {
      const response = await eduApi.get<Survey[]>(SURVEY_CREATED_SURVEYS_ENDPOINT);
      const surveys = response.data;
      set({ createdSurveys: surveys, isFetchingCreatedSurveys: false });
      return surveys;
    } catch (error) {
      set({ errorFetchingCreatedSurveys: error as AxiosError, isFetchingCreatedSurveys: false });
      return [];
    }
  },

  updateAnsweredSurveys: async (): Promise<Survey[]> => {
    set({ errorFetchingAnsweredSurveys: null, isFetchingAnsweredSurveys: true });
    try {
      const response = await eduApi.get<Survey[]>(SURVEY_ANSWERED_SURVEYS_ENDPOINT);
      const surveys = response.data;
      set({ answeredSurveys: surveys, isFetchingAnsweredSurveys: false });
      return surveys;
    } catch (error) {
      set({ errorFetchingAnsweredSurveys: error as AxiosError, isFetchingAnsweredSurveys: false });
      return [];
    }
  },

  updateAllSurveys: async (): Promise<Survey[]> => {
    set({ errorFetchingAllSurveys: null, isFetchingAllSurveys: true });
    try {
      const response = await eduApi.get<Survey[]>(SURVEY_All_SURVEYS_ENDPOINT);
      const surveys = response.data;
      set({ allSurveys: surveys, isFetchingAllSurveys: false });
      return surveys;
    } catch (error) {
      set({ errorFetchingAllSurveys: error as AxiosError, isFetchingAllSurveys: false });
      return [];
    }
  },

  patchSurvey: async (survey: Survey): Promise<Survey> => {
    set({ errorPostingSurvey: null, isPosting: true });
    try {
      const response = await eduApi.post<Survey>(SURVEYS_ENDPOINT, { ...survey });
      set({ isPosting: false });
      return response.data;
    } catch (error) {
      set({ errorPostingSurvey: error as AxiosError, isPosting: false });
      throw error;
    }
  },
}));

export default useSurveyTablesPageStore;
