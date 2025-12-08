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
import MultipleSelectorGroup from '@libs/groups/types/multipleSelectorGroup';
import { Group } from '@libs/groups/types/group';
import { EDU_API_GROUPS_ENDPOINT } from '@libs/groups/constants/eduApiEndpoints';

type GroupStore = {
  searchGroupsIsLoading: boolean;
  searchGroupsError: string | null;
  searchGroups: (searchParam: string) => Promise<MultipleSelectorGroup[]>;
};

const initialState = {
  searchGroupsIsLoading: false,
  searchGroupsError: null,
};

const useGroupStore = create<GroupStore>((set) => ({
  ...initialState,
  searchGroups: async (searchParam) => {
    set({ searchGroupsError: null, searchGroupsIsLoading: true });
    try {
      const response = await eduApi.get<Group[]>(`${EDU_API_GROUPS_ENDPOINT}?groupName=${searchParam}`);

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
}));

export default useGroupStore;
