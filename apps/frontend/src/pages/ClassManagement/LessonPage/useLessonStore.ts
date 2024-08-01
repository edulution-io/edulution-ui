import { create, StateCreator } from 'zustand';
import { createJSONStorage, persist, PersistOptions } from 'zustand/middleware';
import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';
import useLmnApiStore from '@/store/useLmnApiStore';
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
  openDialogType: null,
  userGroupToEdit: null,
  member: [],
};

type PersistentLessonStore = (
  lessonData: StateCreator<LessonStore>,
  options: PersistOptions<LessonStore>,
) => StateCreator<LessonStore>;

const useLessonStore = create<LessonStore>(
  (persist as PersistentLessonStore)(
    (set) => ({
      ...initialState,

      setMember: (member) => set({ member }),
      setOpenDialogType: (type) => set({ openDialogType: type }),
      setUserGroupToEdit: (group) => set({ userGroupToEdit: group }),

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
          set({ isLoading: false });
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
          set({ isLoading: false });
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
          set({ isLoading: false });
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
          set({ isLoading: false });
        }
      },

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

export default useLessonStore;
