/*
 * LICENSE
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import ClassManagementStore from '@libs/classManagement/types/store/classManagementStore';
import { create, StateCreator } from 'zustand';
import { createJSONStorage, persist, PersistOptions } from 'zustand/middleware';
import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';
import MultipleSelectorGroup from '@libs/groups/types/multipleSelectorGroup';
import useLmnApiStore from '@/store/useLmnApiStore';
import LmnApiSearchResult from '@libs/lmnApi/types/lmnApiSearchResult';
import LMN_API_EDU_API_ENDPOINTS from '@libs/lmnApi/constants/eduApiEndpoints';
import LmnApiSchoolClass from '@libs/lmnApi/types/lmnApiSchoolClass';
import LmnApiProject from '@libs/lmnApi/types/lmnApiProject';
import LmnApiSession from '@libs/lmnApi/types/lmnApiSession';
import LmnApiProjectWithMembers from '@libs/lmnApi/types/lmnApiProjectWithMembers';
import LmnApiSchoolClassWithMembers from '@libs/lmnApi/types/lmnApiSchoolClassWithMembers';
import sortGroups from '@libs/groups/utils/sortGroups';
import sortByName from '@libs/common/utils/sortByName';
import LmnApiRoom from '@libs/lmnApi/types/lmnApiRoom';
import minimizeFormValues from '@libs/groups/utils/minimizeFormValues';
import LmnApiPrinter from '@libs/lmnApi/types/lmnApiPrinter';
import LmnApiPrinterWithMembers from '@libs/lmnApi/types/lmnApiPrinterWithMembers';
import { HTTP_HEADERS } from '@libs/common/types/http-methods';

const { PROJECT, SCHOOL_CLASSES, PRINTERS, ROOM, SEARCH_USERS_OR_GROUPS, USER_SESSIONS } = LMN_API_EDU_API_ENDPOINTS;

const initialState = {
  isLoading: false,
  isRoomLoading: false,
  isSessionLoading: false,
  areSessionsLoading: false,
  isProjectLoading: false,
  areProjectsLoading: false,
  isPrinterLoading: false,
  arePrintersLoading: false,
  isSchoolClassLoading: false,
  areSchoolClassesLoading: false,
  userSchoolClasses: [],
  userProjects: [],
  userSessions: [],
  userRoom: null,
  printers: [],
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
    (set, get) => ({
      ...initialState,

      fetchProject: async (projectName: string) => {
        if (get().isProjectLoading) return null;

        set({ isProjectLoading: true, error: null });
        try {
          const { lmnApiToken } = useLmnApiStore.getState();
          const response = await eduApi.get<LmnApiProjectWithMembers>(`${PROJECT}/${projectName}`, {
            headers: { [HTTP_HEADERS.XApiKey]: lmnApiToken },
          });

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
            PROJECT,
            {
              formValues: minimizeFormValues(formValues),
            },
            {
              headers: { [HTTP_HEADERS.XApiKey]: lmnApiToken },
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
            PROJECT,
            {
              formValues: minimizeFormValues(formValues),
            },
            {
              headers: { [HTTP_HEADERS.XApiKey]: lmnApiToken },
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

          await eduApi.delete(`${PROJECT}/${projectName}`, {
            headers: { [HTTP_HEADERS.XApiKey]: lmnApiToken },
          });
        } catch (error) {
          handleApiError(error, set);
        } finally {
          set({ isProjectLoading: false });
        }
      },

      fetchUserProjects: async () => {
        if (get().areProjectsLoading) return;
        try {
          set({ areProjectsLoading: true, error: null });
          const { lmnApiToken } = useLmnApiStore.getState();
          const response = await eduApi.get<LmnApiProject[]>(PROJECT, {
            headers: { [HTTP_HEADERS.XApiKey]: lmnApiToken },
          });

          set({ userProjects: sortGroups<LmnApiProject>(response.data) });
        } catch (error) {
          handleApiError(error, set);
        } finally {
          set({ areProjectsLoading: false });
        }
      },

      fetchUserSession: async (sessionSid: string) => {
        if (get().isSessionLoading) return null;
        set({ isSessionLoading: true, error: null });
        try {
          const { lmnApiToken } = useLmnApiStore.getState();
          const response = await eduApi.get<LmnApiSession>(`${USER_SESSIONS}/${sessionSid}`, {
            headers: { [HTTP_HEADERS.XApiKey]: lmnApiToken },
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
            USER_SESSIONS,
            {
              formValues: minimizeFormValues(formValues),
            },
            {
              headers: { [HTTP_HEADERS.XApiKey]: lmnApiToken },
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
            USER_SESSIONS,
            {
              formValues: minimizeFormValues(formValues),
            },
            {
              headers: { [HTTP_HEADERS.XApiKey]: lmnApiToken },
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
          await eduApi.delete(`${USER_SESSIONS}/${sessionId}`, {
            headers: { [HTTP_HEADERS.XApiKey]: lmnApiToken },
          });
        } catch (error) {
          handleApiError(error, set);
        } finally {
          set({ isSessionLoading: false });
        }
      },

      fetchUserSessions: async () => {
        if (get().areSessionsLoading) return;
        try {
          set({ areSessionsLoading: true, error: null });
          const { lmnApiToken } = useLmnApiStore.getState();
          const response = await eduApi.get<LmnApiSession[]>(USER_SESSIONS, {
            headers: { [HTTP_HEADERS.XApiKey]: lmnApiToken },
          });

          set({ userSessions: response.data.sort(sortByName) });
        } catch (error) {
          handleApiError(error, set);
        } finally {
          set({ areSessionsLoading: false });
        }
      },

      fetchSchoolClass: async (schoolClassName: string) => {
        if (get().isSchoolClassLoading) return null;
        set({ isSchoolClassLoading: true, error: null });
        try {
          const { lmnApiToken } = useLmnApiStore.getState();
          const response = await eduApi.get<LmnApiSchoolClassWithMembers>(`${SCHOOL_CLASSES}/${schoolClassName}`, {
            headers: { [HTTP_HEADERS.XApiKey]: lmnApiToken },
          });

          return response.data;
        } catch (error) {
          handleApiError(error, set);
          return null;
        } finally {
          set({ isSchoolClassLoading: false });
        }
      },

      fetchUserSchoolClasses: async () => {
        if (get().areSchoolClassesLoading) return;
        try {
          set({ areSchoolClassesLoading: true, error: null });
          const { lmnApiToken } = useLmnApiStore.getState();
          const response = await eduApi.get<LmnApiSchoolClass[]>(SCHOOL_CLASSES, {
            headers: { [HTTP_HEADERS.XApiKey]: lmnApiToken },
          });

          set({ userSchoolClasses: sortGroups<LmnApiSchoolClass>(response.data) });
        } catch (error) {
          handleApiError(error, set);
        } finally {
          set({ areSchoolClassesLoading: false });
        }
      },

      fetchRoom: async () => {
        if (get().isRoomLoading) return;
        try {
          set({ isRoomLoading: true, error: null });
          const { lmnApiToken } = useLmnApiStore.getState();
          const response = await eduApi.get<LmnApiRoom>(ROOM, {
            headers: { [HTTP_HEADERS.XApiKey]: lmnApiToken },
          });

          set({ userRoom: response.data });
        } catch (error) {
          handleApiError(error, set);
        } finally {
          set({ isRoomLoading: false });
        }
      },

      fetchPrinters: async () => {
        if (get().arePrintersLoading) return;
        try {
          set({ arePrintersLoading: true, error: null });
          const { lmnApiToken } = useLmnApiStore.getState();
          const response = await eduApi.get<LmnApiPrinter[]>(PRINTERS, {
            headers: { [HTTP_HEADERS.XApiKey]: lmnApiToken },
          });

          set({ printers: response.data });
        } catch (error) {
          handleApiError(error, set);
        } finally {
          set({ arePrintersLoading: false });
        }
      },

      fetchPrinter: async (printer: string) => {
        if (get().isPrinterLoading) return null;
        try {
          set({ isPrinterLoading: true, error: null });
          const { lmnApiToken } = useLmnApiStore.getState();
          const response = await eduApi.get<LmnApiPrinterWithMembers>(`${PRINTERS}/${printer}`, {
            headers: { [HTTP_HEADERS.XApiKey]: lmnApiToken },
          });

          return response.data;
        } catch (error) {
          handleApiError(error, set);
          return null;
        } finally {
          set({ isPrinterLoading: false });
        }
      },

      searchGroupsOrUsers: async (searchQuery, t) => {
        try {
          set({ searchGroupsError: null, isSearchGroupsLoading: true });
          const { lmnApiToken } = useLmnApiStore.getState();
          const response = await eduApi.get<LmnApiSearchResult[]>(
            `${SEARCH_USERS_OR_GROUPS}?searchQuery=${searchQuery}`,
            {
              headers: { [HTTP_HEADERS.XApiKey]: lmnApiToken },
            },
          );

          if (!Array.isArray(response.data)) {
            return [];
          }

          const result: (MultipleSelectorGroup & LmnApiSearchResult)[] = response.data.map((d) => ({
            ...d,
            id: d.dn,
            value: d.cn,
            label: `[${t(d.type)}] ${d.displayName} (${d.cn})`,
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
