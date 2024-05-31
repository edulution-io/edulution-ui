import { create } from 'zustand';
import { PageView } from '@/pages/Surveys/components/types/page-view';
import { Survey } from '@/pages/Surveys/components/types/survey';
import UsersSurveysTypes from '@/pages/Surveys/components/types/users-surveys-table-type';
import eduApi from "@/api/eduApi.ts";
import SURVEY_ENDPOINT from "@/pages/Surveys/components/dto/survey-endpoint.dto.ts";

interface SurveysPageStore {
  selectedPageView: PageView;
  setPageViewOpenSurveys: () => void;
  setPageViewCreatedSurveys: () => void;
  setPageViewAnsweredSurveys: () => void;
  setPageViewSurveyEditor: () => void;
  setPageViewSurveyCreator: () => void;
  setPageViewSurveysManagement: () => void;

  selectedSurvey: Survey | undefined;
  resetSelectedSurvey: () => void;
  setSelectedSurvey: (survey: Survey) => void;

  setSurveyActionCreate: () => void;
  setSurveyActionAnswer: () => void;
  setSurveyActionResults: () => void;

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

  patchSurvey: (survey: Survey) => Promise<Survey>;
  isPosting: boolean;
  errorPostingSurvey: Error | null;

  allSurveys: Survey[];
  updateAllSurveys: () => Promise<Survey[]>;
  isFetchingAllSurveys: boolean;
  errorFetchingAllSurveys: Error | null;

  deleteSurvey: (surveyName: string) => Promise<void>;
  isDeleting: boolean;
  errorOnDeleting: Error | null;

  reset: () => void;
}

const initialState: Partial<SurveysPageStore> = {
  selectedPageView: PageView.OPEN_SURVEYS,
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
  allSurveys: [],
  isFetchingAllSurveys: false,
  errorFetchingAllSurveys: null,
  isDeleting: false,
  errorOnDeleting: null,
};

const useSurveysPageStore = create<SurveysPageStore>((set) => ({
  ...(initialState as SurveysPageStore),
  setPageViewOpenSurveys: () => set({selectedPageView: PageView.OPEN_SURVEYS}),
  setPageViewCreatedSurveys: () => set({selectedPageView: PageView.CREATED_SURVEYS}),
  setPageViewAnsweredSurveys: () => set({selectedPageView: PageView.ANSWERED_SURVEYS}),
  setPageViewSurveyEditor: () => set({selectedPageView: PageView.SURVEY_EDITOR}),
  setPageViewSurveyCreator: () => set({selectedSurvey: undefined, selectedPageView: PageView.SURVEY_CREATOR}),
  setPageViewSurveysManagement: () => set({selectedPageView: PageView.MANAGE_SURVEYS}),

  resetSelectedSurvey: () => set({selectedSurvey: undefined}),
  setSelectedSurvey: (survey: Survey) => set({selectedSurvey: survey}),

  updateOpenSurveys: async (): Promise<Survey[]> => {
    set({errorFetchingOpenSurveys: null, isFetchingOpenSurveys: true});
    try {
      const response = await eduApi.get<Survey[]>(SURVEY_ENDPOINT, {params: {search: UsersSurveysTypes.OPEN}});
      const surveys = response.data;
      set({openSurveys: surveys, isFetchingOpenSurveys: false})
      return surveys;
    } catch (error) {
      set({errorFetchingOpenSurveys: error, isFetchingOpenSurveys: false});
      return []
    }
  },

  updateCreatedSurveys: async (): Promise<Survey[]> => {
    set({errorFetchingCreatedSurveys: null, isFetchingCreatedSurveys: true});
    try {
      const response = await eduApi.get<Survey[]>(SURVEY_ENDPOINT, {params: {search: UsersSurveysTypes.CREATED}});
      const surveys = response.data;
      set({createdSurveys: surveys, isFetchingCreatedSurveys: false});
      return surveys;
    } catch (error) {
      set({errorFetchingCreatedSurveys: error, isFetchingCreatedSurveys: false});
      return []
    }
  },

  updateAnsweredSurveys: async (): Promise<Survey[]> => {
    set({errorFetchingAnsweredSurveys: null, isFetchingAnsweredSurveys: true});
    try {
      const response = await eduApi.get<Survey[]>(SURVEY_ENDPOINT, {params: {search: UsersSurveysTypes.ANSWERED}});
      const surveys = response.data;
      set({answeredSurveys: surveys, isFetchingAnsweredSurveys: false})
      return surveys;
    } catch (error) {
      set({errorFetchingAnsweredSurveys: error, isFetchingAnsweredSurveys: false});
      return []
    }
  },

  updateAllSurveys: async (): Promise<Survey[]> => {
    set({errorFetchingAllSurveys: null, isFetchingAllSurveys: true});
    try {
      const response = await eduApi.get<Survey[]>(SURVEY_ENDPOINT, {params: {search: UsersSurveysTypes.ALL}});
      const surveys = response.data;
      set({allSurveys: surveys, isFetchingAllSurveys: false})
      return surveys;
    } catch (error) {
      set({errorFetchingAllSurveys: error, isFetchingAllSurveys: false});
      return []
    }
  },

  patchSurvey: async (survey: Survey): Promise<Survey> => {
    set({errorPostingSurvey: null, isPosting: true});
    try {
      const response = await eduApi.post<Survey>(SURVEY_ENDPOINT, {...survey});
      set({isPosting: false});
      return response.data;
    } catch (error) {
      set({errorPostingSurvey: error, isPosting: false});
      throw error;
    }
  },

  deleteSurvey: async (surveyName: string): Promise<void> => {
    set({errorOnDeleting: null, isDeleting: true});
    try {
      const response = await eduApi.delete(SURVEY_ENDPOINT, {data: {surveyname: surveyName}});
      set({isDeleting: false});
      return response.data;
    } catch(error) {
      set({errorOnDeleting: error, isDeleting: false});
      throw error;
    }
  },

  reset: () => set(initialState),
}));

export default useSurveysPageStore;
