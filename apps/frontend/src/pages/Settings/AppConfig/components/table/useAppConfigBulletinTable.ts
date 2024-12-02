import { create } from 'zustand';
import eduApi from '@/api/eduApi';
import { BULLETINBOARD_CREATE_CATEGORIE_EDU_API_ENDPOINT } from '@libs/bulletinBoard/constants/apiEndpoints';
import { BulletinCategoryDto } from '@libs/bulletinBoard/type/bulletinCategoryDto';

export interface BulletinBoardTableStore {
  isDialogOpen: boolean;
  setIsDialogOpen: (isOpen: boolean) => void;
  reset: () => void;
  getData: () => Promise<BulletinCategoryDto[]>;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  addNewCategory: (category: BulletinCategoryDto) => Promise<void>;
  categories: BulletinCategoryDto[];
  setSelectedCategory: (category: BulletinCategoryDto | null) => void;
  selectedCategorys: BulletinCategoryDto | null;
  checkIfNameExists: (name: string) => Promise<boolean>;
}

const initialValues = {
  isDialogOpen: false,
  isLoading: true,
  categories: [],
  selectedCategorys: null,
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

  setSelectedCategory: (category) => set({ selectedCategorys: category }),

  getData: async () => {
    set({ isLoading: true });
    try {
      const response = await eduApi.get<BulletinCategoryDto[]>(BULLETINBOARD_CREATE_CATEGORIE_EDU_API_ENDPOINT);
      set({ categories: response.data });
      return response.data || [];
    } catch (error) {
      console.error(error);
      return [];
    } finally {
      set({ isLoading: false });
    }
  },

  checkIfNameExists: async (name: string): Promise<boolean> => {
    try {
      const response = await eduApi.get<{
        exists: boolean;
      }>(`${BULLETINBOARD_CREATE_CATEGORIE_EDU_API_ENDPOINT}/exists/${name}`);
      return response.data.exists;
    } catch (error) {
      return false;
    }
  },
}));

export default useAppConfigBulletinTable;
