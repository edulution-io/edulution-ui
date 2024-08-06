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
