import ClassManagementStore from '@libs/classManagement/types/store/classManagementStore';
import { create, StateCreator } from 'zustand';
import { createJSONStorage, persist, PersistOptions } from 'zustand/middleware';
import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';
import MultipleSelectorGroup from '@libs/groups/types/multipleSelectorGroup';
import useLmnApiStore from '@/store/useLmnApiStore';
import LmnApiSearchResult from '@libs/lmnApi/types/lmnApiSearchResult';
import {
  LMN_API_EDU_API_PROJECT_ENDPOINT,
  LMN_API_EDU_API_SCHOOL_CLASSES_ENDPOINT,
  LMN_API_ROOM_EDU_API_ENDPOINT,
  LMN_API_SEARCH_USERS_OR_GROUPS_EDU_API_ENDPOINT,
  LMN_API_USER_SESSIONS_EDU_API_ENDPOINT,
} from '@libs/lmnApi/types/eduApiEndpoints';
import LmnApiSchoolClass from '@libs/lmnApi/types/lmnApiSchoolClass';
import LmnApiProject from '@libs/lmnApi/types/lmnApiProject';
import LmnApiSession from '@libs/lmnApi/types/lmnApiSession';
import LmnApiProjectWithMembers from '@libs/lmnApi/types/lmnApiProjectWithMembers';
import LmnApiSchoolClassWithMembers from '@libs/lmnApi/types/lmnApiSchoolClassWithMembers';
import sortGroups from '@libs/groups/utils/sortGroups';
import sortByName from '@libs/common/utils/sortByName';
import LmnApiRoom from '@libs/lmnApi/types/lmnApiRoom';
import minimizeFormValues from '@libs/groups/utils/minimizeFormValues';

const initialState = {
  isLoading: false,
  isRoomLoading: false,
  isSessionLoading: false,
  isProjectLoading: false,
  isSchoolClassLoading: false,
  userSchoolClasses: [],
  userProjects: [],
  userSessions: [],
  userRoom: null,
  searchGroupsError: null,
  isSearchGroupsLoading: false,

  error: null,
};

type PersistentClassManagementStore = (
  lessonData: StateCreator<ClassManagementStore>,
  options: PersistOptions<ClassManagementStore>,
) => StateCreator<ClassManagementStore>;

const useClassManagementStore = create<ClassManagementStore>(
  (persist as PersistentClassManagementStore)(
    (set) => ({
      ...initialState,

      fetchProject: async (projectName: string) => {
        set({ isProjectLoading: true, error: null });
        try {
          const { lmnApiToken } = useLmnApiStore.getState();
          const response = await eduApi.get<LmnApiProjectWithMembers>(
            `${LMN_API_EDU_API_PROJECT_ENDPOINT}/${projectName}`,
            {
              headers: { 'x-api-key': lmnApiToken },
            },
          );

          return response.data;
        } catch (error) {
          handleApiError(error, set);
          return null;
        } finally {
          set({ isProjectLoading: false });
        }
      },

      createProject: async (form) => {
        set({ isProjectLoading: true, error: null });
        try {
          const { lmnApiToken } = useLmnApiStore.getState();
          const formValues = form.getValues();
          await eduApi.post(
            LMN_API_EDU_API_PROJECT_ENDPOINT,
            {
              formValues: minimizeFormValues(formValues),
            },
            {
              headers: { 'x-api-key': lmnApiToken },
            },
          );
        } catch (error) {
          handleApiError(error, set);
        } finally {
          set({ isProjectLoading: false });
        }
      },

      updateProject: async (form) => {
        set({ isProjectLoading: true, error: null });
        try {
          const { lmnApiToken } = useLmnApiStore.getState();
          const formValues = form.getValues();
          await eduApi.patch(
            LMN_API_EDU_API_PROJECT_ENDPOINT,
            {
              formValues: minimizeFormValues(formValues),
            },
            {
              headers: { 'x-api-key': lmnApiToken },
            },
          );
        } catch (error) {
          handleApiError(error, set);
        } finally {
          set({ isProjectLoading: false });
        }
      },

      deleteProject: async (projectName) => {
        set({ isProjectLoading: true, error: null });
        try {
          const { lmnApiToken } = useLmnApiStore.getState();

          await eduApi.delete(`${LMN_API_EDU_API_PROJECT_ENDPOINT}/${projectName}`, {
            headers: { 'x-api-key': lmnApiToken },
          });
        } catch (error) {
          handleApiError(error, set);
        } finally {
          set({ isProjectLoading: false });
        }
      },

      fetchUserProjects: async () => {
        try {
          set({ isLoading: true, error: null });
          const { lmnApiToken } = useLmnApiStore.getState();
          const response = await eduApi.get<LmnApiProject[]>(LMN_API_EDU_API_PROJECT_ENDPOINT, {
            headers: { 'x-api-key': lmnApiToken },
          });

          set({ userProjects: sortGroups<LmnApiProject>(response.data) });
        } catch (error) {
          handleApiError(error, set);
        } finally {
          set({ isLoading: false });
        }
      },

      fetchUserSession: async (sessionSid: string) => {
        set({ isSessionLoading: true, error: null });
        try {
          const { lmnApiToken } = useLmnApiStore.getState();
          const response = await eduApi.get<LmnApiSession>(`${LMN_API_USER_SESSIONS_EDU_API_ENDPOINT}/${sessionSid}`, {
            headers: { 'x-api-key': lmnApiToken },
          });

          return response.data;
        } catch (error) {
          handleApiError(error, set);
          return null;
        } finally {
          set({ isSessionLoading: false });
        }
      },

      createSession: async (form) => {
        set({ isSessionLoading: true, error: null });
        try {
          const { lmnApiToken } = useLmnApiStore.getState();
          const formValues = form.getValues();

          await eduApi.post(
            LMN_API_USER_SESSIONS_EDU_API_ENDPOINT,
            {
              formValues: minimizeFormValues(formValues),
            },
            {
              headers: { 'x-api-key': lmnApiToken },
            },
          );
        } catch (error) {
          handleApiError(error, set);
        } finally {
          set({ isSessionLoading: false });
        }
      },

      updateSession: async (form) => {
        set({ isSessionLoading: true, error: null });
        try {
          const { lmnApiToken } = useLmnApiStore.getState();
          const formValues = form.getValues();

          await eduApi.patch(
            LMN_API_USER_SESSIONS_EDU_API_ENDPOINT,
            {
              formValues: minimizeFormValues(formValues),
            },
            {
              headers: { 'x-api-key': lmnApiToken },
            },
          );
        } catch (error) {
          handleApiError(error, set);
        } finally {
          set({ isSessionLoading: false });
        }
      },

      removeSession: async (sessionId) => {
        set({ isSessionLoading: true, error: null });
        try {
          const { lmnApiToken } = useLmnApiStore.getState();
          await eduApi.delete(`${LMN_API_USER_SESSIONS_EDU_API_ENDPOINT}/${sessionId}`, {
            headers: { 'x-api-key': lmnApiToken },
          });
        } catch (error) {
          handleApiError(error, set);
        } finally {
          set({ isSessionLoading: false });
        }
      },

      fetchUserSessions: async () => {
        try {
          set({ isLoading: true, error: null });
          const { lmnApiToken } = useLmnApiStore.getState();
          const response = await eduApi.get<LmnApiSession[]>(LMN_API_USER_SESSIONS_EDU_API_ENDPOINT, {
            headers: { 'x-api-key': lmnApiToken },
          });

          set({ userSessions: response.data.sort(sortByName) });
        } catch (error) {
          handleApiError(error, set);
        } finally {
          set({ isLoading: false });
        }
      },

      fetchSchoolClass: async (schoolClassName: string) => {
        set({ isSchoolClassLoading: true, error: null });
        try {
          const { lmnApiToken } = useLmnApiStore.getState();
          const response = await eduApi.get<LmnApiSchoolClassWithMembers>(
            `${LMN_API_EDU_API_SCHOOL_CLASSES_ENDPOINT}/${schoolClassName}`,
            {
              headers: { 'x-api-key': lmnApiToken },
            },
          );

          return response.data;
        } catch (error) {
          handleApiError(error, set);
          return null;
        } finally {
          set({ isSchoolClassLoading: false });
        }
      },

      fetchUserSchoolClasses: async () => {
        try {
          set({ isLoading: true, error: null });
          const { lmnApiToken } = useLmnApiStore.getState();
          const response = await eduApi.get<LmnApiSchoolClass[]>(LMN_API_EDU_API_SCHOOL_CLASSES_ENDPOINT, {
            headers: { 'x-api-key': lmnApiToken },
          });

          set({ userSchoolClasses: sortGroups<LmnApiSchoolClass>(response.data) });
        } catch (error) {
          handleApiError(error, set);
        } finally {
          set({ isLoading: false });
        }
      },

      fetchRoom: async () => {
        try {
          set({ isRoomLoading: true, error: null });
          const { lmnApiToken } = useLmnApiStore.getState();
          const response = await eduApi.get<LmnApiRoom>(LMN_API_ROOM_EDU_API_ENDPOINT, {
            headers: { 'x-api-key': lmnApiToken },
          });

          set({ userRoom: response.data });
        } catch (error) {
          handleApiError(error, set);
        } finally {
          set({ isRoomLoading: false });
        }
      },

      searchGroupsOrUsers: async (searchQuery) => {
        try {
          set({ searchGroupsError: null, isSearchGroupsLoading: true });
          const { lmnApiToken } = useLmnApiStore.getState();
          const response = await eduApi.get<LmnApiSearchResult[]>(
            `${LMN_API_SEARCH_USERS_OR_GROUPS_EDU_API_ENDPOINT}?searchQuery=${searchQuery}`,
            {
              headers: { 'x-api-key': lmnApiToken },
            },
          );

          if (!Array.isArray(response.data)) {
            return [];
          }

          const result: (MultipleSelectorGroup & LmnApiSearchResult)[] = response.data.map((d) => ({
            ...d,
            id: d.dn,
            value: d.cn,
            label: `${d.displayName} (${d.cn})`,
            name: d.cn,
            path: d.cn,
          }));

          return result;
        } catch (error) {
          handleApiError(error, set, 'searchGroupsError');
          return [];
        } finally {
          set({ isSearchGroupsLoading: false });
        }
      },

      reset: () => set({ ...initialState }),
    }),
    {
      name: 'class-management',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        userSchoolClasses: state.userSchoolClasses,
        userProjects: state.userProjects,
        userSessions: state.userSessions,
      }),
    } as PersistOptions<ClassManagementStore>,
  ),
);

export default useClassManagementStore;