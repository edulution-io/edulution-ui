import { create, StateCreator } from 'zustand';
import { createJSONStorage, persist, PersistOptions } from 'zustand/middleware';
import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';
import useLmnApiStore from '@/store/lmnApiStore';
import {
  LMN_API_ADD_MANAGEMENT_GROUPS_EDU_API_ENDPOINT,
  LMN_API_REMOVE_MANAGEMENT_GROUPS_EDU_API_ENDPOINT,
  LMN_API_START_EXAM_MODE_EDU_API_ENDPOINT,
  LMN_API_STOP_EXAM_MODE_EDU_API_ENDPOINT,
} from '@libs/lmnApi/types/eduApiEndpoints';
import LmnApiSession from '@libs/lmnApi/types/lmnApiSession';
import LessonStore from '@libs/classManagement/types/store/lessonStore';

const initialState = {
  isLoading: false,
  error: null,
};

type PersistentLessonStore = (
  lessonData: StateCreator<LessonStore>,
  options: PersistOptions<LessonStore>,
) => StateCreator<LessonStore>;

const useClassManagementStore = create<LessonStore>(
  (persist as PersistentLessonStore)(
    (set) => ({
      ...initialState,

      addManagementGroup: async (group: string, users: string[]) => {
        set({ error: null, isLoading: true });
        try {
          const { lmnApiToken } = useLmnApiStore.getState();
          await eduApi.post(LMN_API_ADD_MANAGEMENT_GROUPS_EDU_API_ENDPOINT, {
            lmnApiToken,
            group,
            users,
          });
        } catch (error) {
          handleApiError(error, set);
        } finally {
          set({ isLoading: true });
        }
      },

      removeManagementGroup: async (group: string, users: string[]) => {
        set({ error: null, isLoading: true });
        try {
          const { lmnApiToken } = useLmnApiStore.getState();
          await eduApi.post(LMN_API_REMOVE_MANAGEMENT_GROUPS_EDU_API_ENDPOINT, {
            lmnApiToken,
            group,
            users,
          });
        } catch (error) {
          handleApiError(error, set);
        } finally {
          set({ isLoading: true });
        }
      },

      startExamMode: async (users: string[]) => {
        set({ error: null, isLoading: true });
        try {
          const { lmnApiToken } = useLmnApiStore.getState();
          await eduApi.post<LmnApiSession>(LMN_API_START_EXAM_MODE_EDU_API_ENDPOINT, {
            lmnApiToken,
            users,
          });
        } catch (error) {
          handleApiError(error, set);
        } finally {
          set({ isLoading: true });
        }
      },

      stopExamMode: async (users: string[], groupName?: string, groupType?: string) => {
        set({ error: null, isLoading: true });
        try {
          const { lmnApiToken } = useLmnApiStore.getState();
          await eduApi.post<LmnApiSession>(LMN_API_STOP_EXAM_MODE_EDU_API_ENDPOINT, {
            lmnApiToken,
            users,
            groupName,
            groupType,
          });
        } catch (error) {
          handleApiError(error, set);
        } finally {
          set({ isLoading: true });
        }
      },

      // fetchUserSessions: async () => {
      //   try {
      //     set({ areUserSessionsLoading: true, error: null });
      //     const { lmnApiToken } = useLmnApiStore.getState();
      //     const response = await eduApi.post<LmnApiSession[]>(LMN_API_USER_SESSIONS_EDU_API_ENDPOINT, {
      //       lmnApiToken,
      //     });
      //
      //     set({ userSessions: response.data });
      //   } catch (error) {
      //     handleApiError(error, set);
      //   } finally {
      //     set({ areUserSessionsLoading: false });
      //   }
      // },

      reset: () => set({ ...initialState }),
    }),
    {
      name: 'class-management',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        isLoading: state.isLoading,
      }),
    } as PersistOptions<LessonStore>,
  ),
);

export default useClassManagementStore;
