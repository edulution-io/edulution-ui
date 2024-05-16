import { create } from 'zustand';
import { CompleteEvent } from 'survey-core';
import handleApiError from '@/utils/handleApiError';
import { Survey } from '@/pages/Survey/backend-copy/model';
import getSurvey from '@/pages/Survey/Forms/dto/get-survey.dto';
import deleteSurvey from '@/pages/Survey/Forms/dto/delete-survey.dto';
import getUserSurveys from '@/pages/Survey/Forms/dto/get-user-surveys.dto';
import pushAnswer from '@/pages/Survey/Forms/dto/push-answer.dto';
import UserSurveySearchTypes from '@/pages/Survey/backend-copy/user-survey-search-types-enum.dto';
import getSurveys from '@/pages/Survey/Forms/dto/get-surveys.dto';

interface SurveyStore {
  selectedSurvey: Survey | undefined;
  setSelectedSurvey: (selectSurvey: Survey | undefined) => void;
  surveys: Survey[];
  openSurveys: Survey[];
  createdSurveys: Survey[];
  answeredSurveys: Survey[];
  isLoading: boolean;
  error: Error | null;
  getSurvey: (surveyname: string) => Promise<Survey | undefined>;
  getAllSurveys: () => Promise<Survey[] | undefined>;
  getOpenSurveys: () => Promise<Survey[] | undefined>;
  getCreatedSurveys: () => Promise<Survey[] | undefined>;
  getAnsweredSurveys: () => Promise<Survey[] | undefined>;
  deleteSurvey: (surveyname: string) => void;
  reset: () => void;
}

const useSurveyStore = create<SurveyStore>((set) => ({
  selectedSurvey: undefined,
  setSelectedSurvey: (selectSurvey: Survey | undefined) => set({ selectedSurvey: selectSurvey }),
  surveys: [],
  openSurveys: [],
  createdSurveys: [],
  answeredSurveys: [],
  isLoading: false,
  error: null,
  getSurvey: async (surveyName: string): Promise<Survey | undefined> => {
    set({ isLoading: true });
    try {
      const response = await getSurvey(surveyName);
      set({ isLoading: false });
      return response;
    } catch (error) {
      handleApiError(error, set);
      throw new Error(error);
    }
  },
  answerSurvey: async (surveyName: string, answer: JSON, options: CompleteEvent): Promise<void> => {
    set({ isLoading: true });
    try {
      await pushAnswer(surveyName, answer, options);
      const responseOne = await getUserSurveys(UserSurveySearchTypes.OPEN);
      if (responseOne) {
        set({ openSurveys: responseOne });
      }
      const responseTwo = await getUserSurveys(UserSurveySearchTypes.ANSWERED);
      if (responseTwo) {
        set({ answeredSurveys: responseTwo });
      }
    } catch (error) {
      handleApiError(error, set);
      throw new Error(error);
    } finally {
      set({ isLoading: false });
    }
  },
  deleteSurvey: async (surveyName: string): Promise<void> => {
    set({ isLoading: true });
    try {
      await deleteSurvey(surveyName);
      const responseOne = await getUserSurveys(UserSurveySearchTypes.OPEN);
      if (responseOne) {
        set({ openSurveys: responseOne });
      }
      const responseTwo = await getUserSurveys(UserSurveySearchTypes.CREATED);
      if (responseTwo) {
        set({ createdSurveys: responseTwo });
      }
      const response = await getUserSurveys(UserSurveySearchTypes.ANSWERED);
      if (response) {
        set({ answeredSurveys: response });
      }
    } catch (error) {
      handleApiError(error, set);
      throw new Error(error);
    } finally {
      set({ isLoading: false });
    }
  },
  getOpenSurveys: async (): Promise<Survey[] | undefined> => {
    set({ isLoading: true, error: null });
    try {
      const response = await getUserSurveys(UserSurveySearchTypes.OPEN);
      if (response) {
        set({ openSurveys: response });
      }
      return response;
    } catch (error) {
      handleApiError(error, set);
      throw new Error(error);
    } finally {
      set({ isLoading: false });
    }
  },
  getCreatedSurveys: async (): Promise<Survey[] | undefined> => {
    set({ isLoading: true, error: null });
    try {
      const response = await getUserSurveys(UserSurveySearchTypes.CREATED);
      if (response) {
        set({ createdSurveys: response });
      }
      return response;
    } catch (error) {
      handleApiError(error, set);
      throw new Error(error);
    } finally {
      set({ isLoading: false });
    }
  },
  getAnsweredSurveys: async (): Promise<Survey[] | undefined> => {
    set({ isLoading: true, error: null });
    try {
      const response = await getUserSurveys(UserSurveySearchTypes.ANSWERED);
      if (response) {
        set({ answeredSurveys: response });
      }
      return response;
    } catch (error) {
      handleApiError(error, set);
      throw new Error(error);
    } finally {
      set({ isLoading: false });
    }
  },
  getAllSurveys: async (): Promise<Survey[] | undefined> => {
    set({ isLoading: true, error: null });
    try {
      const response = await getSurveys();
      if (response) {
        set({ surveys: response });
      }
      return response;
    } catch (error) {
      handleApiError(error, set);
      throw new Error(error);
    } finally {
      set({ isLoading: false });
    }
  },
  reset: () => set({ surveys: [], isLoading: false, error: null }),
}));

export default useSurveyStore;
