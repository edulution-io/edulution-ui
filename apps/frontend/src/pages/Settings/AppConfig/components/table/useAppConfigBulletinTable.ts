import { create } from 'zustand';
import eduApi from '@/api/eduApi';
import { BULLETINBOARD_CREATE_CATEGORIE_EDU_API_ENDPOINT } from '@libs/bulletinBoard/constants/apiEndpoints';
import { BulletinCategoryDto } from '@libs/bulletinBoard/type/bulletinCategoryDto';

export interface BulletinBoardTableStore {
  isDialogOpen: boolean;
  setIsDialogOpen: (isOpen: boolean) => void;
  reset: () => void;
  getData: () => BulletinCategoryDto[];
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  addNewCategory: (category: BulletinCategoryDto) => Promise<void>;
  categories: BulletinCategoryDto[];
}

const initialValues = {
  isDialogOpen: false,
  isLoading: true,
  categories: [],
};

const useAppConfigBulletinTable = create<BulletinBoardTableStore>((set) => ({
  ...initialValues,
  setIsLoading: (isLoading: boolean) => set({ isLoading }),
  setIsDialogOpen: (isOpen: boolean) => set({ isDialogOpen: isOpen }),
  reset: () => set(initialValues),
  addNewCategory: async (category: BulletinCategoryDto) => {
    set({ isLoading: true });
    try {
      await eduApi.post<BulletinCategoryDto[]>(BULLETINBOARD_CREATE_CATEGORIE_EDU_API_ENDPOINT, category);
    } catch (error) {
      console.error(error);
    } finally {
      set({ isLoading: false });
    }
  },

  getData: () => [] as BulletinCategoryDto[],
}));

export default useAppConfigBulletinTable;
