import { create } from 'zustand';
import eduApi from '@/api/eduApi';
import { BULLETINBOARD_CREATE_CATEGORIE_EDU_API_ENDPOINT } from '@libs/bulletinBoard/constants/apiEndpoints';
import CreateBulletinCategoryDto from '@libs/bulletinBoard/types/createBulletinCategoryDto';
import BulletinCategoryResponseDto from '@libs/bulletinBoard/types/bulletinCategoryResponseDto';
import handleApiError from '@/utils/handleApiError';
import { toast } from 'sonner';
import i18n from '@/i18n';

export interface BulletinBoardTableStore {
  isDialogOpen: boolean;
  setIsDialogOpen: (isOpen: boolean) => void;
  fetchData: () => Promise<BulletinCategoryResponseDto[]>;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  addNewCategory: (category: CreateBulletinCategoryDto) => Promise<void>;
  data: BulletinCategoryResponseDto[];
  setSelectedCategory: (category: BulletinCategoryResponseDto | null) => void;
  selectedCategory: BulletinCategoryResponseDto | null;
  checkIfNameExists: (name: string) => Promise<boolean>;
  setEditBulletinCategoryDialogOpen: (isOpen: boolean) => void;
  isBulletinCategoryDialogOpen: boolean;
  updateCategory: (id: string, category: CreateBulletinCategoryDto) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  nameExists: boolean | null;
  setNameExists: (isNameAvailable: boolean | null) => void;
  isNameChecking: boolean;
  setIsNameChecking: (isNameChecking: boolean) => void;
  reset: () => void;
}

const initialValues = {
  isDialogOpen: false,
  isLoading: true,
  data: [],
  selectedCategory: null,
  isBulletinCategoryDialogOpen: false,
  isNameAvailable: false,
  isNameChecking: false,
  nameExists: null,
};

const useAppConfigBulletinTableStore = create<BulletinBoardTableStore>((set) => ({
  ...initialValues,
  setIsNameChecking: (isNameChecking: boolean) => set({ isNameChecking }),
  setNameExists: (nameExists: boolean | null) => set({ nameExists }),
  setIsLoading: (isLoading: boolean) => set({ isLoading }),
  setIsDialogOpen: (isOpen: boolean) => set({ isDialogOpen: isOpen }),
  setEditBulletinCategoryDialogOpen: (isOpen) => set({ isBulletinCategoryDialogOpen: isOpen }),
  addNewCategory: async (category: CreateBulletinCategoryDto) => {
    set({ isLoading: true });
    try {
      await eduApi.post<BulletinCategoryResponseDto[]>(BULLETINBOARD_CREATE_CATEGORIE_EDU_API_ENDPOINT, category);
      toast.success(i18n.t('bulletinboard.categoryCreatedSuccessfully'));
    } catch (error) {
      handleApiError(error, set);
    } finally {
      set({ isLoading: false });
    }
  },

  setSelectedCategory: (category) => set({ selectedCategory: category }),

  fetchData: async () => {
    set({ isLoading: true });
    try {
      const response = await eduApi.get<BulletinCategoryResponseDto[]>(BULLETINBOARD_CREATE_CATEGORIE_EDU_API_ENDPOINT);
      set({ data: response.data });
      return response.data || [];
    } catch (error) {
      handleApiError(error, set);
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
      toast.success(i18n.t('bulletinboard.categoryUpdatedSuccessfully'));
    } catch (error) {
      handleApiError(error, set);
    } finally {
      set({ isLoading: false });
    }
  },

  deleteCategory: async (id: string) => {
    set({ isLoading: true });
    try {
      await eduApi.delete(`${BULLETINBOARD_CREATE_CATEGORIE_EDU_API_ENDPOINT}/${id}`);
      toast.success(i18n.t('bulletinboard.categoryDeletedSuccessfully'));
    } catch (error) {
      handleApiError(error, set);
    } finally {
      set({ isLoading: false });
    }
  },

  reset: () => set(initialValues),
}));

export default useAppConfigBulletinTableStore;
