import { create } from 'zustand';
// import eduApi from '@/api/eduApi';
import Conference from '@/pages/ConferencePage/dto/conference.dto';
import mockedConferences from '@/components/feature/Home/Notifications/components/mocked-values/mocked-conferences.ts';
import Mail from '@/components/feature/Home/Notifications/components/types/mail.ts';
import mockedMails from '@/components/feature/Home/Notifications/components/mocked-values/mocked-mails.ts';
import { Survey } from '@/pages/Surveys/types/survey';
import mockedSurveys from '@/components/feature/Home/Notifications/components/mocked-values/mocked-surveys.ts';
// import NOTIFICATION_ENDPOINT from "@/components/feature/Home/Notifications/components/types/notification-endpoint.ts";

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

  mails: Mail[];
  isFetchingMails: boolean;
  errorFetchingMails: Error | null;
  fetchMails: () => Promise<Mail[]>;

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
    // set({ isLoadingConferences: true, errorLoadingConferences: null });
    // try {
    //   const response = await eduApi.get<Conference[]>(NOTIFICATION_ENDPOINT + 'conferenences/');
    //   const conferences = response.data;
    //   set({ conferences: conferences || mockedConferences, isLoadingConferences: false });
    //   return conferences;
    // } catch (error) {
    //   set({ errorLoadingConferences: error, isLoadingConferences: false });
    //   return mockedConferences;
    // }
    set ({ conferences: mockedConferences });
    return mockedConferences;
  },

  getOpenSurveys: async (): Promise<Survey[]> => {
    // set({ isFetchingOpenSurveys: true, errorFetchingOpenSurveys: null });
    // try {
    //   const response = await eduApi.get<Survey[]>(NOTIFICATION_ENDPOINT + 'surveys/');
    //   const surveys = response.data;
    //   set({ openSurveys: surveys || mockedSurveys, isFetchingOpenSurveys: false });
    //   return surveys;
    // } catch (error) {
    //   set({ errorFetchingOpenSurveys: error, isFetchingOpenSurveys: false });
    //   return mockedSurveys;
    // }
    set ({ openSurveys: mockedSurveys });
    return mockedSurveys;
  },

  fetchMails: async (): Promise<Mail[]> => {
    // set({ errorFetchingMails: null, isFetchingMails: true });
    // try {
    //   const response = await eduApi.get<Mail[]>(NOTIFICATION_ENDPOINT + 'mails/');
    //   const mails = response.data;
    //   set({ mails: mails || mockedMails, isFetchingMails: false });
    //   return mails;
    // } catch (error) {
    //   set({ errorFetchingMails: error, isFetchingMails: false });
    //   return mockedMails;
    // }
    set ({ mails: mockedMails });
    return mockedMails;
  },

  reset: () => set(initialState),
}));

export default useNotificationStore;
