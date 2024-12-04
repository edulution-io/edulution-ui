import { create } from 'zustand';
import eduApi from '@/api/eduApi';
import { BULLETINBOARD_CREATE_CATEGORIE_EDU_API_ENDPOINT } from '@libs/bulletinBoard/constants/apiEndpoints';
import CreateBulletinCategoryDto from '@libs/bulletinBoard/types/createBulletinCategoryDto';
import BulletinCategoryResponseDto from '@libs/bulletinBoard/types/bulletinCategoryResponseDto';

export interface BulletinBoardTableStore {
  isDialogOpen: boolean;
  setIsDialogOpen: (isOpen: boolean) => void;
  reset: () => void;
  fetchCategories: () => Promise<BulletinCategoryResponseDto[]>;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  addNewCategory: (category: CreateBulletinCategoryDto) => Promise<void>;
  categories: BulletinCategoryResponseDto[];
  setSelectedCategory: (category: BulletinCategoryResponseDto | null) => void;
  selectedCategory: BulletinCategoryResponseDto | null;
  checkIfNameExists: (name: string) => Promise<boolean>;
  setEditBulletinCategoryDialogOpen: (isOpen: boolean) => void;
  isBulletinCategoryDialogOpen: boolean;
  updateCategory: (id: string, category: CreateBulletinCategoryDto) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
}

const initialValues = {
  isDialogOpen: false,
  isLoading: true,
  categories: [],
  selectedCategory: null,
  isBulletinCategoryDialogOpen: false,
};

const useAppConfigBulletinTableStore = create<BulletinBoardTableStore>((set) => ({
  ...initialValues,
  setIsLoading: (isLoading: boolean) => set({ isLoading }),
  setIsDialogOpen: (isOpen: boolean) => set({ isDialogOpen: isOpen }),
  setEditBulletinCategoryDialogOpen: (isOpen) => set({ isBulletinCategoryDialogOpen: isOpen }),
  reset: () => set(initialValues),
  addNewCategory: async (category: CreateBulletinCategoryDto) => {
    set({ isLoading: true });
    try {
      await eduApi.post<BulletinCategoryResponseDto[]>(BULLETINBOARD_CREATE_CATEGORIE_EDU_API_ENDPOINT, category);
    } catch (error) {
      console.error(error);
    } finally {
      set({ isLoading: false });
    }
  },

  setSelectedCategory: (category) => set({ selectedCategory: category }),

  fetchCategories: async () => {
    set({ isLoading: true });
    try {
      const response = await eduApi.get<BulletinCategoryResponseDto[]>(BULLETINBOARD_CREATE_CATEGORIE_EDU_API_ENDPOINT);
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

  updateCategory: async (id: string, category: CreateBulletinCategoryDto) => {
    set({ isLoading: true });
    try {
      await eduApi.patch(`${BULLETINBOARD_CREATE_CATEGORIE_EDU_API_ENDPOINT}/${id}`, category);
    } catch (error) {
      console.error(error);
    } finally {
      set({ isLoading: false });
    }
  },

  deleteCategory: async (id: string) => {
    set({ isLoading: true });
    try {
      await eduApi.delete(`${BULLETINBOARD_CREATE_CATEGORIE_EDU_API_ENDPOINT}/${id}`);
    } catch (error) {
      console.error(error);
    } finally {
      set({ isLoading: false });
    }
  },
}));

export default useAppConfigBulletinTableStore;
