import { create } from 'zustand';
import { AxiosError } from 'axios';
import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';
import { CONFERENCES_EDU_API_ENDPOINT } from '@libs/conferences/constants/apiEndpoints';
import CreateConferenceDto from '@libs/conferences/types/create-conference.dto';
import ConferenceDto from '@libs/conferences/types/conference.dto';

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
  createdConference: ConferenceDto | null;
}

const initialState: Partial<CreateConferenceDialogStore> = {
  isCreateConferenceDialogOpen: false,
  isLoading: false,
  error: null,
  createdConference: null,
};

const useCreateConferenceDialogStore = create<CreateConferenceDialogStore>((set) => ({
  ...(initialState as CreateConferenceDialogStore),
  openCreateConferenceDialog: () => set({ isCreateConferenceDialogOpen: true }),
  closeCreateConferenceDialog: () => set({ isCreateConferenceDialogOpen: false }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setError: (error: AxiosError) => set({ error }),
  reset: () => set(initialState),

  createConference: async (conference) => {
    set({ isLoading: true, error: null });
    try {
      const response = await eduApi.post<ConferenceDto>(CONFERENCES_EDU_API_ENDPOINT, conference);
      set({ createdConference: response.data, isCreateConferenceDialogOpen: false });
    } catch (error) {
      handleApiError(error, set);
    } finally {
      set({ isLoading: false });
    }
  },
}));

export default useCreateConferenceDialogStore;
