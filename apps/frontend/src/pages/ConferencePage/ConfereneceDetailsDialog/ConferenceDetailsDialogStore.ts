import { create } from 'zustand';
import { AxiosError } from 'axios';
import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';
import apiEndpoint, { CONFERENCES_JOIN_EDU_API_ENDPOINT } from '@/pages/ConferencePage/apiEndpoint';
import Conference from '@libs/conferences/types/conference.dto';

interface ConferenceDetailsDialogStore {
  selectedConference: Conference | null;
  setSelectedConference: (conference: Conference | null) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  error: AxiosError | null;
  setError: (error: AxiosError) => void;
  reset: () => void;
  joinConference: (meetingID: string) => Promise<void>;
  joinConferenceUrl: string;
  setJoinConferenceUrl: (url: string) => void;
  isJoinedConferenceMinimized: boolean;
  toggleIsJoinedConferenceMinimized: () => void;
  updateConference: (conference: Partial<Conference>) => Promise<void>;
}

const initialState = {
  selectedConference: null,
  isLoading: false,
  error: null,
  joinConferenceUrl: '',
  isJoinedConferenceMinimized: false,
};

const useConferenceDetailsDialogStore = create<ConferenceDetailsDialogStore>((set) => ({
  ...initialState,
  setSelectedConference: (conference) => set({ selectedConference: conference }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setError: (error: AxiosError) => set({ error }),
  reset: () => set(initialState),

  joinConference: async (meetingID) => {
    set({ isLoading: true, error: null });
    try {
      const response = await eduApi.get<string>(`${CONFERENCES_JOIN_EDU_API_ENDPOINT}${meetingID}`);
      set({ joinConferenceUrl: response.data, isLoading: false });
    } catch (error) {
      handleApiError(error, set);
    } finally {
      set({ isLoading: false });
    }
  },
  setJoinConferenceUrl: (url) => set({ joinConferenceUrl: url, isJoinedConferenceMinimized: false }),
  toggleIsJoinedConferenceMinimized: () =>
    set((state) => ({ isJoinedConferenceMinimized: !state.isJoinedConferenceMinimized })),
  updateConference: async (conference) => {
    set({ isLoading: true });
    try {
      await eduApi.patch<Conference[]>(apiEndpoint, conference);
      set({ selectedConference: null });
    } catch (error) {
      handleApiError(error, set);
    } finally {
      set({ isLoading: false });
    }
  },
}));

export default useConferenceDetailsDialogStore;
