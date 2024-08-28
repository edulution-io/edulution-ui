import { create, StateCreator } from 'zustand';
import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';
import useLmnApiStore from '@/store/useLmnApiStore';
import {
  LMN_API_EDU_API_PROJECT_ENDPOINT,
  LMN_API_EDU_API_SCHOOL_CLASSES_ENDPOINT,
  LMN_API_EXAM_MODE_EDU_API_ENDPOINT,
  LMN_API_MANAGEMENT_GROUPS_EDU_API_ENDPOINT,
  LMN_API_PRINTERS_EDU_API_ENDPOINT,
} from '@libs/lmnApi/types/eduApiEndpoints';
import LmnApiSession from '@libs/lmnApi/types/lmnApiSession';
import LessonStore from '@libs/classManagement/types/store/lessonStore';
import LmnApiProject from '@libs/lmnApi/types/lmnApiProject';
import LmnApiPrinter from '@libs/lmnApi/types/lmnApiPrinter';
import LmnApiSchoolClass from '@libs/lmnApi/types/lmnApiSchoolClass';
import { createJSONStorage, persist, PersistOptions } from 'zustand/middleware';
import GroupJoinState from '@libs/classManagement/constants/joinState.enum';
import { HTTP_HEADERS } from '@libs/common/types/http-methods';

const initialState = {
  isLoading: false,
  error: null,
  openDialogType: null,
  userGroupToEdit: null,
  member: [],
  currentGroupType: undefined,
  currentGroupName: undefined,
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
              headers: { [HTTP_HEADERS.XApiKey]: lmnApiToken },
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
            headers: { [HTTP_HEADERS.XApiKey]: lmnApiToken },
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
          await eduApi.put<LmnApiSession>(
            `${LMN_API_EXAM_MODE_EDU_API_ENDPOINT}/start`,
            {
              users,
            },
            {
              headers: { [HTTP_HEADERS.XApiKey]: lmnApiToken },
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
          await eduApi.put<LmnApiSession>(
            `${LMN_API_EXAM_MODE_EDU_API_ENDPOINT}/stop`,
            {
              users,
              groupName,
              groupType,
            },
            {
              headers: { [HTTP_HEADERS.XApiKey]: lmnApiToken },
            },
          );
        } catch (error) {
          handleApiError(error, set);
        } finally {
          set({ isLoading: false });
        }
      },

      toggleSchoolClassJoined: async (isAlreadyJoined, schoolClass) => {
        set({ error: null, isLoading: true });
        try {
          const { lmnApiToken } = useLmnApiStore.getState();
          const param = isAlreadyJoined ? GroupJoinState.Quit : GroupJoinState.Join;
          await eduApi.put<LmnApiSchoolClass>(
            `${LMN_API_EDU_API_SCHOOL_CLASSES_ENDPOINT}/${schoolClass}/${param}`,
            undefined,
            {
              headers: { [HTTP_HEADERS.XApiKey]: lmnApiToken },
            },
          );
        } catch (error) {
          handleApiError(error, set);
        } finally {
          set({ isLoading: false });
        }
      },

      toggleProjectJoined: async (isAlreadyJoined, project) => {
        set({ error: null, isLoading: true });
        try {
          const { lmnApiToken } = useLmnApiStore.getState();
          const param = isAlreadyJoined ? GroupJoinState.Quit : GroupJoinState.Join;
          await eduApi.put<LmnApiProject>(`${LMN_API_EDU_API_PROJECT_ENDPOINT}/${project}/${param}`, undefined, {
            headers: { [HTTP_HEADERS.XApiKey]: lmnApiToken },
          });
        } catch (error) {
          handleApiError(error, set);
        } finally {
          set({ isLoading: false });
        }
      },

      togglePrinterJoined: async (isAlreadyJoined, printer) => {
        set({ error: null, isLoading: true });
        try {
          const { lmnApiToken } = useLmnApiStore.getState();
          const param = isAlreadyJoined ? GroupJoinState.Quit : GroupJoinState.Join;
          await eduApi.put<LmnApiPrinter>(`${LMN_API_PRINTERS_EDU_API_ENDPOINT}/${printer}/${param}`, undefined, {
            headers: { [HTTP_HEADERS.XApiKey]: lmnApiToken },
          });
        } catch (error) {
          handleApiError(error, set);
        } finally {
          set({ isLoading: false });
        }
      },

      setCurrentGroupType(groupType?: string) {
        set({ currentGroupType: groupType });
      },
      setCurrentGroupName(groupName?: string) {
        set({ currentGroupName: groupName });
      },

      reset: () => set({ ...initialState }),
    }),
    {
      name: 'class-management-lesson',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentGroupName: state.currentGroupName,
        currentGroupType: state.currentGroupType,
        member: state.member,
      }),
    } as PersistOptions<LessonStore>,
  ),
);

export default useLessonStore;
