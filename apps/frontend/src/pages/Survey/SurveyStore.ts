import { create } from 'zustand';
import handleApiError from '@/utils/handleApiError';
import { Survey } from '@/pages/Survey/backend-copy/model';
import getSurvey from '@/pages/Survey/components/dto/get-survey.dto';
import deleteSurvey from '@/pages/Survey/components/dto/delete-survey.dto';
import getUserSurveys from '@/pages/Survey/components/dto/get-user-surveys.dto';
import UserSurveySearchTypes from '@/pages/Survey/backend-copy/user-survey-search-types-enum.dto';
import getSurveys from '@/pages/Survey/components/dto/get-surveys.dto';

interface SurveyStore {
  openSurveys: Survey[];
  getOpenSurveys: () => Promise<Survey[] | undefined>;
  createdSurveys: Survey[];
  getCreatedSurveys: () => Promise<Survey[] | undefined>;
  answeredSurveys: Survey[];
  getAnsweredSurveys: () => Promise<Survey[] | undefined>;
  surveys: Survey[];
  getAllSurveys: () => Promise<Survey[] | undefined>;
  getSurvey: (surveyname: string) => Promise<Survey | undefined>;
  deleteSurvey: (surveyname: string) => void;
  selectedSurvey: Survey | undefined;
  setSelectedSurvey: (selectSurvey: Survey | undefined) => void;
  isLoading: boolean;
  error: Error | null;
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
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
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
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
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
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
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
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      throw new Error(error);
    } finally {
      set({ isLoading: false });
    }
  },
  getSurvey: async (surveyName: string): Promise<Survey | undefined> => {
    set({ isLoading: true });
    try {
      const response = await getSurvey(surveyName);
      set({ isLoading: false });
      return response;
    } catch (error) {
      handleApiError(error, set);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      throw new Error(error);
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
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      throw new Error(error);
    } finally {
      set({ isLoading: false });
    }
  },
  reset: () => set({ surveys: [], isLoading: false, error: null }),
}));

export default useSurveyStore;
