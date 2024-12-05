import { create } from 'zustand';
import eduApi from '@/api/eduApi';
import { BULLETIN_BOARD_EDU_API_ENDPOINT } from '@libs/bulletinBoard/constants/apiEndpoints';
import handleApiError from '@/utils/handleApiError';
import BulletinsByCategoryNames from '@libs/bulletinBoard/types/bulletinsByCategoryNames';

export interface BulletinBoardTableStore {
  reset: () => void;
  isLoading: boolean;
  error: Error | null;
  getBulletinsByCategoryNames: () => Promise<void>;
  bulletinsByCategories: BulletinsByCategoryNames | null;
}

const initialValues = {
  isLoading: true,
  error: null,
  bulletinsByCategories: null,
};

const useBulletinBoardStore = create<BulletinBoardTableStore>((set) => ({
  ...initialValues,
  reset: () => set(initialValues),

  getBulletinsByCategoryNames: async (isLoading = true) => {
    set({ isLoading, error: null });
    try {
      const { data } = await eduApi.get<BulletinsByCategoryNames>(BULLETIN_BOARD_EDU_API_ENDPOINT);
      set({ bulletinsByCategories: data });
    } catch (error) {
      handleApiError(error, set);
    } finally {
      set({ isLoading: false });
    }
  },
}));

export default useBulletinBoardStore;
