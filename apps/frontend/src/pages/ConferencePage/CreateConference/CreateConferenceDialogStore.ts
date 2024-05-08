import { create } from 'zustand';
import { AxiosError } from 'axios';
import CreateConferenceDto from '@/pages/ConferencePage/dto/create-conference.dto';
import { Conference } from '@/pages/ConferencePage/dto/conference.dto';
import eduApiInstance from '@/api/eduApiInstance';
import handleApiError from '@/utils/handleApiError';

interface CreateConferenceDialogStore {
  isCreateConferenceDialogOpen: boolean;
  openCreateConferenceDialog: () => void;
  closeCreateConferenceDialog: () => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  error: AxiosError | null;
  setError: (error: AxiosError) => void;
  reset: () => void;
  createConference: (conference: CreateConferenceDto) => Promise<void>;
  createdConference: Conference | null;
}

const initialState: Partial<CreateConferenceDialogStore> = {
  isCreateConferenceDialogOpen: false,
  isLoading: false,
  error: null,
  createdConference: null,
};

const apiEndpoint = 'conferences/';

const useCreateConferenceDialogStore = create<CreateConferenceDialogStore>((set) => ({
  isCreateConferenceDialogOpen: false,
  openCreateConferenceDialog: () => set({ isCreateConferenceDialogOpen: true }),
  closeCreateConferenceDialog: () => set({ isCreateConferenceDialogOpen: false }),
  isLoading: false,
  setIsLoading: (isLoading) => set({ isLoading }),
  error: null,
  setError: (error: AxiosError) => set({ error }),
  reset: () => set(initialState),

  createConference: async (conference) => {
    set({ isLoading: true });
    try {
      const response = await eduApiInstance.post<Conference>(apiEndpoint, conference);
      set({ createdConference: response.data, isLoading: false });
    } catch (error) {
      handleApiError(error, set);
    }
  },

  createdConference: null,
}));

export default useCreateConferenceDialogStore;
