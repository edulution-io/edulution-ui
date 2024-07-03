import { create } from 'zustand';
import { AxiosError } from 'axios';
import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';
import apiEndpoint from '@/pages/ConferencePage/apiEndpoint';
import CreateConferenceDto from '@libs/conferences/types/create-conference.dto';
import Conference from '@libs/conferences/types/conference.dto';
import AttendeeDto from '@libs/conferences/types/attendee.dto';
import { EDU_API_USERS_SEARCH_ENDPOINT } from '@/api/endpoints/users';
import { LDAPUser } from '@libs/user/types/groups/ldapUser';
import MultipleSelectorGroup from '@libs/user/types/groups/multipleSelectorGroup';
import { Group } from '@libs/user/types/groups/group';

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
  searchAttendees: (searchQuery: string) => Promise<AttendeeDto[]>;
  searchGroups: (searchQuery: string) => Promise<MultipleSelectorGroup[]>;
  getGroupMembers: (groupId: string) => Promise<AttendeeDto[]>;
  isGetGroupMembersLoading: boolean;
}

const initialState: Partial<CreateConferenceDialogStore> = {
  isCreateConferenceDialogOpen: false,
  isLoading: false,
  error: null,
  createdConference: null,
  isGetGroupMembersLoading: false,
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
      const response = await eduApi.get<AttendeeDto[]>(`${EDU_API_USERS_SEARCH_ENDPOINT}${searchParam}`);

      if (!Array.isArray(response.data)) {
        return [];
      }

      return response.data?.map((d) => ({
        ...d,
        value: d.username,
        label: `${d.firstName} ${d.lastName} (${d.username})`,
      }));
    } catch (error) {
      handleApiError(error, set);
      return [];
    }
  },

  searchGroups: async (searchParam) => {
    set({ error: null });
    try {
      const response = await eduApi.get<Group[]>(`/groups/${searchParam}`);

      if (!Array.isArray(response.data)) {
        return [];
      }

      const result: MultipleSelectorGroup[] = response.data.map((d) => ({
        ...d,
        value: d.id,
        label: d.name,
      }));

      return result;
    } catch (error) {
      handleApiError(error, set);
      return [];
    }
  },

  getGroupMembers: async (groupId) => {
    set({ isGetGroupMembersLoading: true, error: null });
    try {
      const response = await eduApi.get<LDAPUser[]>(`/classmanagement/${groupId}`);

      if (!Array.isArray(response.data)) {
        return [];
      }

      return response.data?.map((d) => ({
        ...d,
        value: d.username,
        label: `${d.firstName} ${d.lastName} (${d.username})`,
      }));
    } catch (error) {
      handleApiError(error, set);
      return [];
    } finally {
      set({ isGetGroupMembersLoading: false });
    }
  },
}));

export default useCreateConferenceDialogStore;
