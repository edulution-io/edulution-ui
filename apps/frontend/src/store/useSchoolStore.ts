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
import type LmnApiSchools from '@libs/lmnApi/types/lmnApiSchools';
import { HTTP_HEADERS } from '@libs/common/types/http-methods';

interface SchoolState {
  schools: LmnApiSchools[];
  selectedSchool: string;
}

interface SchoolActions {
  reset: () => void;
  setSelectedSchool: (school: string) => void;
  getSchools: () => Promise<void>;
}

type SchoolStore = SchoolState & SchoolActions;

const initialState = {
  schools: [] as LmnApiSchools[],
  selectedSchool: '',
};

const useSchoolStore = create<SchoolStore>((set) => ({
  ...initialState,

  setSelectedSchool: (school) => set({ selectedSchool: school }),

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
}));

export default useSchoolStore;
