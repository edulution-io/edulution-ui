import { create } from 'zustand';
import eduApi from '@/api/eduApi';
import { BULLETIN_BOARD_EDU_API_ENDPOINT } from '@libs/bulletinBoard/constants/apiEndpoints';
import handleApiError from '@/utils/handleApiError';
import BulletinsByCategory from '@libs/bulletinBoard/types/bulletinsByCategory';

export interface BulletinBoardTableStore {
  reset: () => void;
  isLoading: boolean;
  error: Error | null;
  getBulletinsByCategories: () => Promise<void>;
  bulletinsByCategories: BulletinsByCategory | null;
}

const initialValues = {
  isLoading: false,
  error: null,
  bulletinsByCategories: null,
};

const useBulletinBoardStore = create<BulletinBoardTableStore>((set, get) => ({
  ...initialValues,
  reset: () => set(initialValues),

  getBulletinsByCategories: async (isLoading = true) => {
    if (get().isLoading) return;
    set({ isLoading, error: null });
    try {
      const { data } = await eduApi.get<BulletinsByCategory>(BULLETIN_BOARD_EDU_API_ENDPOINT);
      set({ bulletinsByCategories: data });
    } catch (error) {
      handleApiError(error, set);
    } finally {
      set({ isLoading: false });
    }
  },
}));

export default useBulletinBoardStore;
