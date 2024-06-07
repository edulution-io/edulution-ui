import { create } from 'zustand';
import { AxiosError } from 'axios';
import CreateConferenceDto from '@/pages/ConferencePage/dto/create-conference.dto';
import Conference from '@/pages/ConferencePage/dto/conference.dto';
import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';
import apiEndpoint from '@/pages/ConferencePage/apiEndpoint';
import { USERS_SEARCH_EDU_API_ENDPOINT } from '@/api/useUserQuery';
import Attendee from '@/pages/ConferencePage/dto/attendee';
import Group from '@/pages/ConferencePage/dto/group';
import { GroupInfo } from '@/pages/SchoolmanagementPage/utilis/groups';
import { LDAPUser } from '@/pages/SchoolmanagementPage/store/ldapUser';

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
  searchGroups: (searchQuery: string) => Promise<Group[]>;
  getGroupMembers: (groupId: string) => Promise<Attendee[]>;
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
      const response = await eduApi.get<Attendee[]>(`${USERS_SEARCH_EDU_API_ENDPOINT}${searchParam}`);

      if (!Array.isArray(response.data)) {
        return [];
      }

      const searchAttendeesResult = response.data?.map((d) => ({
        ...d,
        value: d.username,
        label: `${d.firstName} ${d.lastName} (${d.username})`,
      }));

      return searchAttendeesResult;
    } catch (error) {
      handleApiError(error, set);
      return [];
    }
  },

  searchGroups: async (searchParam) => {
    set({ error: null });
    try {
      const response = await eduApi.get<GroupInfo[]>(`/classmanagement/groups/${searchParam}`);

      if (!Array.isArray(response.data)) {
        return [];
      }

      const result: Group[] = response.data.map((d) => ({
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

      const result = response.data?.map((d) => ({
        ...d,
        value: d.username,
        label: `${d.firstName} ${d.lastName} (${d.username})`,
      }));

      set({ isGetGroupMembersLoading: false });
      return result;
    } catch (error) {
      handleApiError(error, set, { errorName: 'error', isLoadingName: 'isGetGroupMembersLoading' });
      return [];
    }
  },
}));

export default useCreateConferenceDialogStore;
