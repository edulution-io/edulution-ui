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

import { create } from 'zustand';
import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';
import useLmnApiStore from '@/store/useLmnApiStore';
import LMN_API_EDU_API_ENDPOINTS from '@libs/lmnApi/constants/lmnApiEduApiEndpoints';
import { HTTP_HEADERS, ResponseType } from '@libs/common/types/http-methods';
import type FileExportFormat from '@libs/classManagement/types/fileExportFormat';
import downloadFileFromBuffer from '@libs/classManagement/utils/downloadFileFromBuffer';
import LmnApiSchoolClass from '@libs/lmnApi/types/lmnApiSchoolClass';

interface ClassListsStoreState {
  isLoading: boolean;
  error: Error | null;
}

interface ClassListsStoreActions {
  downloadStudentsList: (schoolclass: string, format: FileExportFormat) => Promise<void>;
  downloadStudentsLists: (schoolclasses: LmnApiSchoolClass[], format: FileExportFormat) => Promise<void>;
  reset: () => void;
}

type ClassListsStore = ClassListsStoreState & ClassListsStoreActions;

const initialState: ClassListsStoreState = {
  isLoading: false,
  error: null,
};

const useClassListsStore = create<ClassListsStore>((set, get) => ({
  ...initialState,

  downloadStudentsList: async (schoolclass: string, format: FileExportFormat) => {
    set({ error: null, isLoading: true });
    try {
      const { lmnApiToken } = useLmnApiStore.getState();
      const response = await eduApi.get<ArrayBuffer>(
        `${LMN_API_EDU_API_ENDPOINTS.STUDENTS_LIST}/${schoolclass}/${format}`,
        {
          headers: { [HTTP_HEADERS.XApiKey]: lmnApiToken },
          responseType: ResponseType.ARRAYBUFFER,
        },
      );

      const filename = `${schoolclass}-students-list.${format}`;
      downloadFileFromBuffer(response.data, filename, format);
    } catch (error) {
      handleApiError(error, set);
    } finally {
      set({ isLoading: false });
    }
  },

  downloadStudentsLists: async (schoolclasses: LmnApiSchoolClass[], format: FileExportFormat) => {
    set({ error: null, isLoading: true });
    try {
      await schoolclasses.reduce(
        (chain, schoolclass) => chain.then(() => get().downloadStudentsList(schoolclass.cn, format)),
        Promise.resolve(),
      );
    } catch (error) {
      handleApiError(error, set);
    } finally {
      set({ isLoading: false });
    }
  },

  reset: () => set({ ...initialState }),
}));

export default useClassListsStore;
