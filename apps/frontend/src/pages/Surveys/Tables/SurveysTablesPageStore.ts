import { create } from 'zustand';
import { CompleteEvent } from 'survey-core';
import { AxiosError } from 'axios';
import eduApi from '@/api/eduApi';
import SURVEYS_ENDPOINT from '@libs/survey/utils/surveys-endpoint';
import SurveysPageView from '@libs/survey/types/page-view';
import Attendee from '@libs/conferences/types/attendee';
import Survey from '@libs/survey/types/survey';
import UserSurveySearchTypes from '@libs/survey/types/user-survey-search-types-enum';
import { EMPTY_JSON } from '@libs/survey/utils/empty-json';

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

  deleteSurvey: (id: number) => Promise<void>;
  isDeleting: boolean;
  errorOnDeleting: Error | null;

  isOpenParticipateSurveyDialog: boolean;
  openParticipateSurveyDialog: () => void;
  closeParticipateSurveyDialog: () => void;
  commitAnswer: (surveyId: number, answer: JSON, options?: CompleteEvent) => Promise<string>;
  isCommiting: boolean;
  errorCommiting: Error | null;

  isOpenCommitedAnswersDialog: boolean;
  openCommitedAnswersDialog: () => void;
  closeCommitedAnswersDialog: () => void;
  getUsersCommitedAnswer: (surveyId: number, userName?: string) => Promise<JSON | undefined>;
  user: string | undefined;
  selectUser: (user: string) => void;
  answer: JSON | undefined;
  isLoadingAnswer: boolean;
  errorLoadingAnswer: Error | null;

  isOpenPublicResultsTableDialog: boolean;
  openPublicResultsTableDialog: () => void;
  closePublicResultsTableDialog: () => void;
  isOpenPublicResultsVisualisationDialog: boolean;
  openPublicResultsVisualisationDialog: () => void;
  closePublicResultsVisualisationDialog: () => void;
  getSurveyResult: (surveyId: number, participants: Attendee[]) => Promise<JSON[] | undefined>;
  result: JSON[];
  isLoadingResult: boolean;
  errorLoadingResult: Error | null;

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

  isDeleting: false,
  errorOnDeleting: null,

  isOpenParticipateSurveyDialog: false,
  isCommiting: false,
  errorCommiting: null,
  isOpenCommitedAnswersDialog: false,
  user: undefined,
  answer: undefined,
  isLoadingAnswer: false,
  errorLoadingAnswer: null,
  isOpenPublicResultsTableDialog: false,
  isOpenPublicResultsVisualisationDialog: false,
  result: undefined,
  isLoadingResult: false,
  errorLoadingResult: null,
};

const useSurveyTablesPageStore = create<SurveysTablesPageStore>((set) => ({
  ...(initialState as SurveysTablesPageStore),
  reset: () => set(initialState),

  updateSelectedPageView: (pageView: SurveysPageView) => set({ selectedPageView: pageView }),
  selectSurvey: (survey: Survey | undefined) => set({ selectedSurvey: survey }),

  updateOpenSurveys: async (): Promise<Survey[]> => {
    set({ errorFetchingOpenSurveys: null, isFetchingOpenSurveys: true });
    try {
      const response = await eduApi.get<Survey[]>(SURVEYS_ENDPOINT, { params: { search: UserSurveySearchTypes.OPEN } });
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
      const response = await eduApi.get<Survey[]>(SURVEYS_ENDPOINT, {
        params: { search: UserSurveySearchTypes.CREATED },
      });
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
      const response = await eduApi.get<Survey[]>(SURVEYS_ENDPOINT, {
        params: { search: UserSurveySearchTypes.ANSWERED },
      });
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
      const response = await eduApi.get<Survey[]>(SURVEYS_ENDPOINT, { params: { search: UserSurveySearchTypes.ALL } });
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

  deleteSurvey: async (surveyID: number): Promise<void> => {
    set({ errorOnDeleting: null, isDeleting: true });
    try {
      await eduApi.delete(SURVEYS_ENDPOINT, { params: { id: surveyID } });
      set({ isDeleting: false });
    } catch (error) {
      set({ errorOnDeleting: error as AxiosError, isDeleting: false });
      throw error;
    }
  },

  openParticipateSurveyDialog: () => set({ isOpenParticipateSurveyDialog: true }),
  closeParticipateSurveyDialog: () => set({ isOpenParticipateSurveyDialog: false }),
  commitAnswer: async (surveyId: number, answer: JSON, options?: CompleteEvent): Promise<string> => {
    set({ errorCommiting: null, isCommiting: true });
    try {
      // Display the "Saving..." message (pass a string value to display a custom message)
      options?.showSaveInProgress();

      const response = await eduApi.patch<string>(SURVEYS_ENDPOINT, {
        surveyId,
        answer,
      });

      // Display the "Success" message (pass a string value to display a custom message)
      options?.showSaveSuccess();

      set({ isCommiting: false });
      return response.data;
    } catch (error) {
      // Display the "Error" message (pass a string value to display a custom message)
      options?.showSaveError();

      set({ errorCommiting: error as AxiosError, isCommiting: false });
      return '';
    }
  },

  openCommitedAnswersDialog: () => set({ isOpenCommitedAnswersDialog: true }),
  closeCommitedAnswersDialog: () => set({ isOpenCommitedAnswersDialog: false }),
  selectUser: (userName: string) => set({ user: userName }),
  getUsersCommitedAnswer: async (surveyId: number): Promise<JSON> => {
    set({ isLoadingAnswer: true, errorLoadingAnswer: null });
    try {
      const response = await eduApi.get<JSON>(SURVEYS_ENDPOINT, {
        params: { search: UserSurveySearchTypes.ANSWER, surveyId },
      });
      const answer = response.data;
      set({ answer, isLoadingAnswer: false });
      return answer;
    } catch (error) {
      set({ answer: undefined, errorLoadingAnswer: error as AxiosError, isLoadingAnswer: false });
      return EMPTY_JSON;
    }
  },

  openPublicResultsTableDialog: () => set({ isOpenPublicResultsTableDialog: true }),
  closePublicResultsTableDialog: () => set({ isOpenPublicResultsTableDialog: false }),
  openPublicResultsVisualisationDialog: () => set({ isOpenPublicResultsVisualisationDialog: true }),
  closePublicResultsVisualisationDialog: () => set({ isOpenPublicResultsVisualisationDialog: false }),
  getSurveyResult: async (surveyId: number, participants: Attendee[]): Promise<JSON[]> => {
    set({ isLoadingResult: true, errorLoadingResult: null });
    try {
      const response = await eduApi.get<JSON[]>(SURVEYS_ENDPOINT, {
        params: {
          search: UserSurveySearchTypes.ANSWERS,
          surveyId,
        },
        data: {
          surveyId,
          participants,
          isAnonymous: false,
        },
      });
      const result = response.data;
      set({ result, isLoadingResult: false });
      return result;
    } catch (error) {
      set({ errorLoadingResult: error as AxiosError, result: undefined, isLoadingResult: false });
      return [EMPTY_JSON];
    }
  },
}));

export default useSurveyTablesPageStore;
