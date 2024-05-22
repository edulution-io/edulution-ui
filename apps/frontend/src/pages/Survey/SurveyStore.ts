import { create } from 'zustand';
import handleApiError from '@/utils/handleApiError';
import { Survey } from '@/pages/Survey/backend-copy/model';
import getSurvey from '@/pages/Survey/components/dto/get-survey.dto';
import deleteSurvey from '@/pages/Survey/components/dto/delete-survey.dto';
import getUserSurveys from '@/pages/Survey/components/dto/get-user-surveys.dto';
import UserSurveyTypes from '@/pages/Survey/backend-copy/user-survey-search-types-enum.dto';
import getSurveys from '@/pages/Survey/components/dto/get-surveys.dto';

interface SurveyStore {
  openSurveys: Survey[];
  getOpenSurveys: () => Promise<Survey[] | undefined>;
  createdSurveys: Survey[];
  getCreatedSurveys: () => Promise<Survey[] | undefined>;
  answeredSurveys: Survey[];
  getAnsweredSurveys: () => Promise<Survey[] | undefined>;
  allSurveys: Survey[];
  getAllSurveys: () => Promise<Survey[] | undefined>;
  getSurvey: (surveyname: string) => Promise<Survey | undefined>;
  deleteSurvey: (surveyname: string | undefined) => void;
  selectedSurvey: Survey | undefined;
  setSelectedSurvey: (selectSurvey: Survey | undefined) => void;
  selectedSurveyType: UserSurveyTypes | undefined;
  setSelectedSurveyType: (userSurveyTypes: UserSurveyTypes | undefined) => void;
  shouldRefresh: boolean;
  setShouldRefresh: (refresh: boolean) => void;
  isLoading: boolean;
  error: Error | null;
  reset: () => void;
}

const initialState: Partial<SurveyStore> = {
  allSurveys: [],
  openSurveys: [],
  createdSurveys: [],
  answeredSurveys: [],
  selectedSurvey: undefined,
  selectedSurveyType: undefined,
  shouldRefresh: true,
  isLoading: false,
  error: null,
};

const useSurveyStore = create<SurveyStore>((set) => ({
  ...(initialState as SurveyStore),
  setSelectedSurveyType: (userSurveyTypes: UserSurveyTypes | undefined) => set({ selectedSurveyType: userSurveyTypes }),
  setSelectedSurvey: (selectSurvey: Survey | undefined) => set({ selectedSurvey: selectSurvey }),
  setShouldRefresh: (refresh: boolean) => set({ shouldRefresh: refresh }),
  getOpenSurveys: async (): Promise<Survey[] | undefined> => {
    set({ isLoading: true, error: null });
    try {
      const response = await getUserSurveys(UserSurveyTypes.OPEN);
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
      const response = await getUserSurveys(UserSurveyTypes.CREATED);
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
      const response = await getUserSurveys(UserSurveyTypes.ANSWERED);
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
        set({ allSurveys: response });
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
  deleteSurvey: async (surveyName: string | undefined) => {
    if (!surveyName) {
      return;
    }
    set({ isLoading: true });
    try {
      await deleteSurvey(surveyName);
      set({ shouldRefresh: true });
      set({ isLoading: false });
    } catch (error) {
      handleApiError(error, set);
      set({ isLoading: false });
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      throw new Error(error);
    }
  },
  reset: () => set({ allSurveys: [], isLoading: false, error: null }),
}));

export default useSurveyStore;
