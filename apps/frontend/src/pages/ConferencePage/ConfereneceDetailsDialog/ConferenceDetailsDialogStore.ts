import { create } from 'zustand';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import i18n from '@/i18n';
import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';
import ConferenceDto from '@libs/conferences/types/conference.dto';
import {
  CONFERENCES_EDU_API_ENDPOINT,
  CONFERENCES_JOIN_EDU_API_ENDPOINT,
} from '@libs/conferences/constants/apiEndpoints';

interface ConferenceDetailsDialogStore {
  selectedConference: ConferenceDto | null;
  setSelectedConference: (conference: ConferenceDto | null) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  error: AxiosError | null;
  setError: (error: AxiosError) => void;
  reset: () => void;
  joinConference: (meetingID: string, password?: string) => Promise<void>;
  joinConferenceUrl: string;
  setJoinConferenceUrl: (url: string) => void;
  updateConference: (conference: Partial<ConferenceDto>) => Promise<void>;
}

const initialState = {
  selectedConference: null,
  isLoading: false,
  error: null,
  joinConferenceUrl: '',
};

const useConferenceDetailsDialogStore = create<ConferenceDetailsDialogStore>((set, get) => ({
  ...initialState,
  setSelectedConference: (conference) => set({ selectedConference: conference }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setError: (error: AxiosError) => set({ error }),
  reset: () => set(initialState),

  joinConference: async (meetingID, password) => {
    if (get().isLoading) return;

    set({ isLoading: true, error: null });
    try {
      if (get().joinConferenceUrl) {
        toast.error(i18n.t('conferences.errors.AlreadyInAnotherMeeting'));
        return;
      }

      const response = await eduApi.get<string>(
        `${CONFERENCES_JOIN_EDU_API_ENDPOINT}/${meetingID}?password=${password}`,
      );
      set({ joinConferenceUrl: response.data, isLoading: false });
    } catch (error) {
      handleApiError(error, set);
    } finally {
      set({ isLoading: false });
    }
  },

  setJoinConferenceUrl: (url) => set({ joinConferenceUrl: url }),

  updateConference: async (conference) => {
    set({ isLoading: true });
    try {
      await eduApi.patch<ConferenceDto[]>(CONFERENCES_EDU_API_ENDPOINT, conference);
      set({ selectedConference: null });
      toast.success(i18n.t('conferences.conferenceUpdatedSuccessfully'));
    } catch (error) {
      handleApiError(error, set);
    } finally {
      set({ isLoading: false });
    }
  },
}));

export default useConferenceDetailsDialogStore;
