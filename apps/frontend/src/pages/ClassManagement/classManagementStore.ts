import ClassManagementSlice from '@libs/classManagement/types/store/classManagementSlice';
import { create, StateCreator } from 'zustand';
import { createJSONStorage, persist, PersistOptions } from 'zustand/middleware';
import lmnApi from '@/api/lmnApi';
import eduApi from '@/api/eduApi';
import UserGroupsDto from '@libs/groups/types/userGroups.dto';
import { GROUPS_EDU_API_USER_GROUPS_ENDPOINT } from '@libs/groups/constants/eduApiEndpoints';
import handleApiError from '@/utils/handleApiError';
import { Group } from '@libs/groups/types/group';
import { EDU_API_GROUPS_SEARCH_ENDPOINT } from '@/api/endpoints/groups';
import MultipleSelectorGroup from '@libs/groups/types/multipleSelectorGroup';
import useLmnApiStore from '@/store/lmnApiStore';
import LmnApiSearchResult from '@libs/lmnApi/types/lmnApiSearchResult';
import {
  LMN_API_CREATE_PROJECT_EDU_API_ENDPOINT,
  LMN_API_EDU_API_PROJECT_ENDPOINT,
  LMN_API_EDU_API_SCHOOL_CLASS_ENDPOINT,
  LMN_API_SEARCH_USERS_OR_GROUPS_EDU_API_ENDPOINT,
} from '@libs/lmnApi/types/eduApiEndpoints';
import LmnApiSchoolClass from '@libs/lmnApi/types/lmnApiSchoolClass';
import LmnApiProject from '@libs/lmnApi/types/lmnApiProject';

const initialState = {
  userGroups: { classes: [], projects: [], sessions: [] },
  areUserGroupsLoading: false,
  isDialogLoading: false,
  initialPasswords: [],
  searchGroupsError: null,
  searchGroupsIsLoading: false,
  selectedGroup: null,

  classes: {},
  projects: {},
  allSchoolProjects: {},
  allSchoolClasses: {},
  allSchoolPrinters: {},
  error: null,
  availableSessions: [],
  members: {},
  groupsData: { schools: [] },
};

type ClassManagementStore = (
  lessonData: StateCreator<ClassManagementSlice>,
  options: PersistOptions<ClassManagementSlice>,
) => StateCreator<ClassManagementSlice>;

const useClassManagementStore = create<ClassManagementSlice>(
  (persist as ClassManagementStore)(
    (set, get) => ({
      ...initialState,
      createProject: async (form) => {
        set({ isDialogLoading: true });
        try {
          console.log(`form ${JSON.stringify(form, null, 2)}`);
          const { lmnApiToken } = useLmnApiStore.getState();
          const response = await eduApi.post(LMN_API_CREATE_PROJECT_EDU_API_ENDPOINT, {
            lmnApiToken,
            project: form.getValues(),
          });
          console.log(`response.data ${JSON.stringify(response.data, null, 2)}`);
        } catch (error) {
          handleApiError(error, set);
        } finally {
          set({ isDialogLoading: false });
        }
      },

      createSession: async (form) => {
        set({ isDialogLoading: true });
        try {
          console.log(`form ${JSON.stringify(form, null, 2)}`);
          // await lmnApi.post(`/sessions/${user}/${name}`);
        } catch (error) {
          handleApiError(error, set);
        } finally {
          set({ isDialogLoading: false });
        }
      },

      deleteSession: async (form) => {
        set({ isDialogLoading: true });
        try {
          console.log(`form ${JSON.stringify(form, null, 2)}`);
          // await lmnApi.delete(`/sessions/${user}/${sid}`).catch(console.error);
        } catch (error) {
          handleApiError(error, set);
        } finally {
          set({ isDialogLoading: false });
        }
      },

      fetchInitialPasswords: async (className: string): Promise<void> => {
        set({ isDialogLoading: true });
        try {
          const response = await lmnApi.get<Record<string, { firstPassword: string; firstPasswordStillSet: boolean }>>(
            `/schoolclasses/${className}/first_passwords`,
          );

          const initialPasswords = Object.entries(response.data).map(([username, info]) => ({
            username,
            firstPassword: info.firstPassword,
            firstPasswordStillSet: info.firstPasswordStillSet,
          }));

          set({ initialPasswords });
        } catch (error) {
          handleApiError(error, set);
        } finally {
          set({ isDialogLoading: false });
        }
      },

      fetchUserGroups: async () => {
        try {
          if (get().areUserGroupsLoading) return;
          set({ areUserGroupsLoading: true });
          const { lmnApiToken } = useLmnApiStore.getState();
          const response = await eduApi.post<UserGroupsDto>(GROUPS_EDU_API_USER_GROUPS_ENDPOINT, { lmnApiToken });

          set({ userGroups: response.data });
        } catch (error) {
          handleApiError(error, set);
        } finally {
          set({ areUserGroupsLoading: false });
        }
      },

      fetchSchoolClass: async (schoolClassName: string) => {
        try {
          const { lmnApiToken } = useLmnApiStore.getState();
          const response = await eduApi.post<LmnApiSchoolClass>(LMN_API_EDU_API_SCHOOL_CLASS_ENDPOINT, {
            lmnApiToken,
            schoolClassName,
          });

          return response.data;
        } catch (error) {
          handleApiError(error, set);
          return null;
        }
      },

      fetchProject: async (projectName: string) => {
        try {
          const { lmnApiToken } = useLmnApiStore.getState();
          const response = await eduApi.post<LmnApiProject>(LMN_API_EDU_API_PROJECT_ENDPOINT, {
            lmnApiToken,
            projectName,
          });

          return response.data;
        } catch (error) {
          handleApiError(error, set);
          return null;
        }
      },

      searchGroupsOrUsers: async (searchQuery) => {
        try {
          set({ searchGroupsError: null, searchGroupsIsLoading: true });
          const { lmnApiToken } = useLmnApiStore.getState();
          const response = await eduApi.post<LmnApiSearchResult[]>(LMN_API_SEARCH_USERS_OR_GROUPS_EDU_API_ENDPOINT, {
            lmnApiToken,
            searchQuery,
          });

          if (!Array.isArray(response.data)) {
            return [];
          }

          const result: (MultipleSelectorGroup & LmnApiSearchResult)[] = response.data.map((d) => ({
            ...d,
            id: d.dn,
            value: d.cn,
            label: d.cn, // Change to display name
            name: d.cn,
            path: d.cn,
          }));

          return result;
        } catch (error) {
          handleApiError(error, set, 'searchGroupsError');
          return [];
        } finally {
          set({ searchGroupsIsLoading: false });
        }
      },

      searchGroups: async (searchParam) => {
        set({ searchGroupsError: null, searchGroupsIsLoading: true });
        try {
          const response = await eduApi.get<Group[]>(`${EDU_API_GROUPS_SEARCH_ENDPOINT}${searchParam}`);

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
          handleApiError(error, set, 'searchGroupsError');
          return [];
        } finally {
          set({ searchGroupsIsLoading: false });
        }
      },

      reset: () => set({ ...initialState }),
    }),
    {
      name: 'class-management',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        userGroups: state.userGroups,
        classes: state.classes,
        allSchoolProjects: state.allSchoolProjects,
        allSchoolClasses: state.allSchoolClasses,
        allSchoolPrinters: state.allSchoolPrinters,
        members: state.members,
        projects: state.projects,
        availableSessions: state.availableSessions,
      }),
    } as PersistOptions<ClassManagementSlice>,
  ),
);

export default useClassManagementStore;
