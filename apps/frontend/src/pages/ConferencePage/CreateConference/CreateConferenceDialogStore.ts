import { create } from 'zustand';
import { AxiosError } from 'axios';
import CreateConferenceDto from '@/pages/ConferencePage/dto/create-conference.dto';
import Conference from '@/pages/ConferencePage/dto/conference.dto';
import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';
import apiEndpoint from '@/pages/ConferencePage/apiEndpoint';
import { USERS_SEARCH_EDU_API_ENDPOINT } from '@/api/useUserQuery';
import Attendee from '@/pages/ConferencePage/dto/attendee';

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
  searchAttendees: (searchQuery: string) => Promise<Attendee[]>;
  searchAttendeesResult: Attendee[];
}

const initialState: Partial<CreateConferenceDialogStore> = {
  isCreateConferenceDialogOpen: false,
  isLoading: false,
  error: null,
  createdConference: null,
  searchAttendeesResult: [],
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
      const response = await eduApi.post<Conference>(apiEndpoint, conference);
      set({ createdConference: response.data, isLoading: false, isCreateConferenceDialogOpen: false });
    } catch (error) {
      handleApiError(error, set);
    }
  },

  searchAttendees: async (searchParam) => {
    set({ error: null });
    try {
      const response = await eduApi.get<Attendee[]>(`${USERS_SEARCH_EDU_API_ENDPOINT}${searchParam}`);

      if (!Array.isArray(response.data)) {
        return [];
      }

      const searchAttendeesResult = response.data?.map((d) => ({
        ...d,
        value: d.username,
        label: `${d.firstName} ${d.lastName} (${d.username})`,
      }));

      set({ searchAttendeesResult });
      return searchAttendeesResult;
    } catch (error) {
      handleApiError(error, set);
      return [];
    }
  },
}));

export default useCreateConferenceDialogStore;
