/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
 *
 * This software is dual-licensed under the terms of:
 *
 * 1. The GNU Affero General Public License (AGPL-3.0-or-later), as published by the Free Software Foundation.
 *    You may use, modify and distribute this software under the terms of the AGPL, provided that you comply with its conditions.
 *
 *    A copy of the license can be found at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * OR
 *
 * 2. A commercial license agreement with Netzint GmbH. Licensees holding a valid commercial license from Netzint GmbH
 *    may use this software in accordance with the terms contained in such written agreement, without the obligations imposed by the AGPL.
 *
 * If you are uncertain which license applies to your use case, please contact us at info@netzint.de for clarification.
 */

import { create, StateCreator } from 'zustand';
import { createJSONStorage, persist, PersistOptions } from 'zustand/middleware';
import { toast } from 'sonner';
import i18n from '@/i18n';
import eduApi from '@/api/eduApi';
import type ClassManagementStore from '@libs/classManagement/types/store/classManagementStore';
import handleApiError from '@/utils/handleApiError';
import type MultipleSelectorGroup from '@libs/groups/types/multipleSelectorGroup';
import useLmnApiStore from '@/store/useLmnApiStore';
import type LmnApiSearchResult from '@libs/lmnApi/types/lmnApiSearchResult';
import LMN_API_EDU_API_ENDPOINTS from '@libs/lmnApi/constants/lmnApiEduApiEndpoints';
import type LmnApiSchoolClass from '@libs/lmnApi/types/lmnApiSchoolClass';
import type LmnApiProject from '@libs/lmnApi/types/lmnApiProject';
import type LmnApiSession from '@libs/lmnApi/types/lmnApiSession';
import type LmnApiProjectWithMembers from '@libs/lmnApi/types/lmnApiProjectWithMembers';
import type LmnApiSchoolClassWithMembers from '@libs/lmnApi/types/lmnApiSchoolClassWithMembers';
import sortGroups from '@libs/groups/utils/sortGroups';
import sortByName from '@libs/common/utils/sortByName';
import type LmnApiRoom from '@libs/lmnApi/types/lmnApiRoom';
import minimizeFormValues from '@libs/groups/utils/minimizeFormValues';
import type LmnApiPrinter from '@libs/lmnApi/types/lmnApiPrinter';
import type LmnApiPrinterWithMembers from '@libs/lmnApi/types/lmnApiPrinterWithMembers';
import { HTTP_HEADERS } from '@libs/common/types/http-methods';
import type LmnApiSchools from '@libs/lmnApi/types/lmnApiSchools';

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
  schools: [],
  selectedSchool: '',

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

      setSelectedSchool: (school) => set({ selectedSchool: school }),

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
          toast.success(i18n.t('classmanagement.project.createSuccess'));
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
          toast.success(i18n.t('classmanagement.project.updateSuccess'));
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
          toast.success(i18n.t('classmanagement.project.deleteSuccess'));
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
          toast.success(i18n.t('classmanagement.sessions.createSuccess'));
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
          toast.success(i18n.t('classmanagement.sessions.updateSuccess'));
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
          toast.success(i18n.t('classmanagement.sessions.deleteSuccess'));
        } catch (error) {
          handleApiError(error, set);
        } finally {
          set({ isSessionLoading: false });
        }
      },

      fetchUserSessions: async (withMemberDetails) => {
        try {
          set({ areSessionsLoading: true, error: null });
          const { lmnApiToken } = useLmnApiStore.getState();
          const response = await eduApi.get<LmnApiSession[]>(
            `${USER_SESSIONS}?withMemberDetails=${withMemberDetails}`,
            {
              headers: { [HTTP_HEADERS.XApiKey]: lmnApiToken },
            },
          );

          const sortedSessions = response.data.sort(sortByName);
          set({ userSessions: sortedSessions });

          return sortedSessions;
        } catch (error) {
          handleApiError(error, set);
          return [];
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

      getSchools: async () => {
        try {
          const { lmnApiToken } = useLmnApiStore.getState();
          const { data } = await eduApi.get<LmnApiSchools[]>(LMN_API_EDU_API_ENDPOINTS.SCHOOLS, {
            headers: { [HTTP_HEADERS.XApiKey]: lmnApiToken },
          });

          set({ schools: data });
        } catch (error) {
          handleApiError(error, set);
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
