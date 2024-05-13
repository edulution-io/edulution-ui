import { create } from 'zustand';
import { AxiosError } from 'axios';
import CreateConferenceDto from '@/pages/ConferencePage/dto/create-conference.dto';
import { Conference } from '@/pages/ConferencePage/conference.dto';
import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';
import apiEndpoint from '@/pages/ConferencePage/apiEndpoint';
import User from '@/pages/ConferencePage/CreateConference/user';
import { USERS_EDU_API_ENDPOINT } from '@/api/useUserQuery';

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
  searchAttendees: (searchQuery: string) => Promise<User[]>;
}

const initialState: Partial<CreateConferenceDialogStore> = {
  isCreateConferenceDialogOpen: false,
  isLoading: false,
  error: null,
  createdConference: null,
};

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
    set({ isLoading: true, error: null });
    try {
      const response = await eduApi.post<Conference>(apiEndpoint, conference);
      set({ createdConference: response.data, isLoading: false, isCreateConferenceDialogOpen: false });
    } catch (error) {
      handleApiError(error, set);
    }
  },
  createdConference: null,

  searchAttendees: async (searchQuery) => {
    set({ error: null });
    try {
      const response = await eduApi.get<User[]>(`${USERS_EDU_API_ENDPOINT}?q=${searchQuery}`);
      return response.data;
    } catch (error) {
      handleApiError(error, set);
      return [];
    }
  },
}));

export default useCreateConferenceDialogStore;
