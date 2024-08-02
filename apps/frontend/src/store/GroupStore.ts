import { create } from 'zustand';
import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';
import { Group } from '@libs/user/types/groups/group';
import MultipleSelectorGroup from '@libs/user/types/groups/multipleSelectorGroup';
import EDU_API_GROUPS_SEARCH_ENDPOINT from '@libs/user/constants/groups/groups-endpoints';

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
      const response = await eduApi.get<Group[]>(`${EDU_API_GROUPS_SEARCH_ENDPOINT}/${searchParam}`);

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
