import { create } from 'zustand';
import { AxiosError } from 'axios';
import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';
import { CONFERENCES_JOIN_EDU_API_ENDPOINT } from '@/pages/ConferencePage/apiEndpoint';

interface ConferenceDetailsDialogStore {
  isConferenceDetailsDialogOpen: boolean;
  toggleIsConferenceDetailsDialogOpen: (isOpen?: boolean) => void;
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
}

const initialState = {
  isConferenceDetailsDialogOpen: false,
  isLoading: false,
  error: null,
  joinConferenceUrl: '',
  isJoinedConferenceMinimized: false,
};

const useConferenceDetailsDialogStore = create<ConferenceDetailsDialogStore>((set) => ({
  ...initialState,
  toggleIsConferenceDetailsDialogOpen: (isOpen) =>
    set((state) => ({
      isConferenceDetailsDialogOpen: isOpen || !state.isConferenceDetailsDialogOpen,
    })),
  setIsLoading: (isLoading) => set({ isLoading }),
  setError: (error: AxiosError) => set({ error }),
  reset: () => set(initialState),

  joinConference: async (meetingID) => {
    set({ isLoading: true, error: null });
    try {
      const response = await eduApi.get<string>(`${CONFERENCES_JOIN_EDU_API_ENDPOINT}${meetingID}`);
      set({ joinConferenceUrl: response.data, isLoading: false, isConferenceDetailsDialogOpen: false });
    } catch (error) {
      handleApiError(error, set);
    }
  },
  setJoinConferenceUrl: (url) => set({ joinConferenceUrl: url }),
  toggleIsJoinedConferenceMinimized: () =>
    set((state) => ({ isJoinedConferenceMinimized: !state.isJoinedConferenceMinimized })),
}));

export default useConferenceDetailsDialogStore;
