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

import { create } from 'zustand';
import eduApi from '@libs/common/constants/eduApi';
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
