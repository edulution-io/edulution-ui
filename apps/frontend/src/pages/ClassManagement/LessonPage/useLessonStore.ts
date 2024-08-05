import { create, StateCreator } from 'zustand';
import { createJSONStorage, persist, PersistOptions } from 'zustand/middleware';
import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';
import useLmnApiStore from '@/store/useLmnApiStore';
import {
  LMN_API_EXAM_MODE_EDU_API_ENDPOINT,
  LMN_API_MANAGEMENT_GROUPS_EDU_API_ENDPOINT,
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
          await eduApi.post(
            LMN_API_MANAGEMENT_GROUPS_EDU_API_ENDPOINT,
            {
              group,
              users,
            },
            {
              headers: { 'x-api-key': lmnApiToken },
            },
          );
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
          await eduApi.delete(LMN_API_MANAGEMENT_GROUPS_EDU_API_ENDPOINT, {
            data: {
              group,
              users,
            },
            headers: { 'x-api-key': lmnApiToken },
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
          await eduApi.post<LmnApiSession>(
            `${LMN_API_EXAM_MODE_EDU_API_ENDPOINT}/start`,
            {
              users,
            },
            {
              headers: { 'x-api-key': lmnApiToken },
            },
          );
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
          await eduApi.post<LmnApiSession>(
            `${LMN_API_EXAM_MODE_EDU_API_ENDPOINT}/stop`,
            {
              users,
              groupName,
              groupType,
            },
            {
              headers: { 'x-api-key': lmnApiToken },
            },
          );
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
