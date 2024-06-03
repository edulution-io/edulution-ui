import { create } from 'zustand';
import eduApi from '@/api/eduApi';
import SURVEY_ENDPOINT from '@/pages/Surveys/Subpages/components/survey-endpoint';
import apiEndpoint from '@/pages/ConferencePage/apiEndpoint';
import handleApiError from '@/utils/handleApiError';
import Conference from '@/pages/ConferencePage/dto/conference.dto';
import { Survey } from '@/pages/Surveys/Subpages/components/types/survey';
import UsersSurveysTypes from '@/pages/Surveys/Subpages/components/types/users-surveys-table-type';
import mockedSurveys from '@/components/feature/Home/Notifications/mocked-surveys';
import mockedConferences from '@/components/feature/Home/Notifications/mocked-conferences';
import mockedMails from '@/components/feature/Home/Notifications/mocked-mails';
import Mail from '@/components/feature/Home/Notifications/mail';

interface NotificationStore {
  lastUpdated: number | undefined;
  setLastUpdated: (date: number | undefined) => void;

  conferences: Conference[];
  isLoadingConferences: boolean;
  errorLoadingConferences: Error | null;
  getConferences: () => Promise<Conference[]>;

  openSurveys: Survey[];
  isFetchingOpenSurveys: boolean;
  errorFetchingOpenSurveys: Error | null;
  getOpenSurveys: () => Promise<Survey[]>;

  mails: JSON[] | Mail[];
  isFetchingMails: boolean;
  errorFetchingMails: Error | null;
  fetchMails: () => Promise<JSON[] | Mail[]>;

  reset: () => void;
}

const initialState: Partial<NotificationStore> = {
  lastUpdated: undefined,

  conferences: [],
  isLoadingConferences: false,
  errorLoadingConferences: null,

  openSurveys: [],
  isFetchingOpenSurveys: false,
  errorFetchingOpenSurveys: null,

  mails: [],
  isFetchingMails: false,
  errorFetchingMails: null,
};

const useNotificationStore = create<NotificationStore>((set) => ({
  ...(initialState as NotificationStore),
  setLastUpdated: (lastUpdated: number | undefined) => set({ lastUpdated }),

  getConferences: async (): Promise<Conference[]> => {
    set({ isLoadingConferences: true, errorLoadingConferences: null });
    try {
      const response = await eduApi.get<Conference[]>(apiEndpoint);
      const conferences = response.data;
      set({ conferences, isLoadingConferences: false });
      return conferences;
    } catch (error) {
      set({ errorLoadingConferences: error, isLoadingConferences: false });
      handleApiError(error, set);
      return mockedConferences;
    }
  },

  getOpenSurveys: async (): Promise<Survey[]> => {
    set({ errorFetchingOpenSurveys: null, isFetchingOpenSurveys: true });
    try {
      const response = await eduApi.get<Survey[]>(SURVEY_ENDPOINT, { params: { search: UsersSurveysTypes.OPEN } });
      const surveys = response.data;
      set({ openSurveys: surveys, isFetchingOpenSurveys: false });
      return surveys;
    } catch (error) {
      set({ errorFetchingOpenSurveys: error, isFetchingOpenSurveys: false });
      return mockedSurveys;
    }
  },

  fetchMails: async (): Promise<JSON[] | Mail[]> => {
    set({ errorFetchingMails: null, isFetchingMails: true });
    try {
      const response = await eduApi.get<JSON[]>(SURVEY_ENDPOINT);
      const mails = response.data;
      set({ mails: mails, isFetchingMails: false });
      return mails;
    } catch (error) {
      set({ errorFetchingMails: error, isFetchingMails: false });
      return mockedMails;
    }
  },

  reset: () => set(initialState),
}));

export default useNotificationStore;
