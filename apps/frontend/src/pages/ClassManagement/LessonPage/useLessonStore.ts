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

import { create, StateCreator } from 'zustand';
import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';
import useLmnApiStore from '@/store/useLmnApiStore';
import LMN_API_EDU_API_ENDPOINTS from '@libs/lmnApi/constants/eduApiEndpoints';
import LmnApiSession from '@libs/lmnApi/types/lmnApiSession';
import LessonStore from '@libs/classManagement/types/store/lessonStore';
import LmnApiProject from '@libs/lmnApi/types/lmnApiProject';
import LmnApiPrinter from '@libs/lmnApi/types/lmnApiPrinter';
import LmnApiSchoolClass from '@libs/lmnApi/types/lmnApiSchoolClass';
import { createJSONStorage, persist, PersistOptions } from 'zustand/middleware';
import GroupJoinState from '@libs/classManagement/constants/joinState.enum';
import { HTTP_HEADERS } from '@libs/common/types/http-methods';
import CollectFileRequestDTO from '@libs/filesharing/types/CollectFileRequestDTO';
import FileSharingApiEndpoints from '@libs/filesharing/types/fileSharingApiEndpoints';
import { LmnApiCollectOperationsType } from '@libs/lmnApi/types/lmnApiCollectOperationsType';
import { toast } from 'sonner';
import { t } from 'i18next';

const { PROJECT, SCHOOL_CLASSES, EXAM_MODE, MANAGEMENT_GROUPS, PRINTERS } = LMN_API_EDU_API_ENDPOINTS;

const initialState = {
  isLoading: false,
  error: null,
  openDialogType: null,
  userGroupToEdit: null,
  member: [],
  groupTypeFromStore: undefined,
  groupNameFromStore: undefined,
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
            MANAGEMENT_GROUPS,
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

      shareFiles: async (duplicateFileRequestDto, share) => {
        set({ error: null, isLoading: true });
        try {
          await eduApi.post(
            `${FileSharingApiEndpoints.BASE}/${FileSharingApiEndpoints.DUPLICATE}`,
            {
              originFilePath: duplicateFileRequestDto.originFilePath,
              destinationFilePaths: duplicateFileRequestDto.destinationFilePaths,
            },
            { params: { share } },
          );
          toast.info(t('classmanagement.filesSharingStarted'));
        } catch (error) {
          handleApiError(error, set);
        } finally {
          set({ isLoading: false });
        }
      },

      collectFiles: async (
        collectFileRequestDTO: CollectFileRequestDTO[],
        userRole: string,
        type: LmnApiCollectOperationsType,
        share,
      ) => {
        set({ error: null, isLoading: true });
        const queryParamString = `?type=${type}&userRole=${userRole}`;
        try {
          await eduApi.post(
            `${FileSharingApiEndpoints.BASE}/${FileSharingApiEndpoints.COLLECT}/${queryParamString}`,
            {
              collectFileRequestDTO,
            },
            { params: { share } },
          );
          toast.info(t('classmanagement.filesCollectingStarted'));
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
          await eduApi.delete(MANAGEMENT_GROUPS, {
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
            `${EXAM_MODE}/start`,
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
            `${EXAM_MODE}/stop`,
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
          await eduApi.put<LmnApiSchoolClass>(`${SCHOOL_CLASSES}/${schoolClass}/${param}`, undefined, {
            headers: { [HTTP_HEADERS.XApiKey]: lmnApiToken },
          });
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
          await eduApi.put<LmnApiProject>(`${PROJECT}/${project}/${param}`, undefined, {
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
          await eduApi.put<LmnApiPrinter>(`${PRINTERS}/${printer}/${param}`, undefined, {
            headers: { [HTTP_HEADERS.XApiKey]: lmnApiToken },
          });
        } catch (error) {
          handleApiError(error, set);
        } finally {
          set({ isLoading: false });
        }
      },

      setGroupTypeInStore(groupType?: string) {
        set({ groupTypeFromStore: groupType });
      },
      setGroupNameInStore(groupName?: string) {
        set({ groupNameFromStore: groupName });
      },

      reset: () => set({ ...initialState }),
    }),
    {
      name: 'class-management-lesson',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        groupNameFromStore: state.groupNameFromStore,
        groupTypeFromStore: state.groupTypeFromStore,
        member: state.member,
      }),
    } as PersistOptions<LessonStore>,
  ),
);

export default useLessonStore;
