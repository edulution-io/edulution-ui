import { create } from 'zustand';
import eduApi from '@/api/eduApi';
import { BULLETIN_CATEGORY_EDU_API_ENDPOINT } from '@libs/bulletinBoard/constants/apiEndpoints';
import CreateBulletinCategoryDto from '@libs/bulletinBoard/types/createBulletinCategoryDto';
import BulletinCategoryResponseDto from '@libs/bulletinBoard/types/bulletinCategoryResponseDto';
import handleApiError from '@/utils/handleApiError';
import { toast } from 'sonner';
import i18n from '@/i18n';
import { BulletinBoardTableStore } from '@libs/appconfig/types/bulletinBoardTableStore';

const initialValues = {
  isDialogOpen: false,
  isLoading: true,
  selectedCategory: null,
  isBulletinCategoryDialogOpen: false,
  isNameAvailable: false,
  isNameChecking: false,
  tableContentData: [],
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
      await eduApi.post<BulletinCategoryResponseDto[]>(BULLETIN_CATEGORY_EDU_API_ENDPOINT, category);
      toast.success(i18n.t('bulletinboard.categoryCreatedSuccessfully'));
    } catch (error) {
      handleApiError(error, set);
    } finally {
      set({ isLoading: false });
    }
  },

  setSelectedCategory: (category) => set({ selectedCategory: category }),

  fetchTableContent: async () => {
    set({ isLoading: true });
    try {
      const response = await eduApi.get<BulletinCategoryResponseDto[]>(BULLETIN_CATEGORY_EDU_API_ENDPOINT);
      set({ tableContentData: response.data });
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
      const response = await eduApi.post<{ exists: boolean }>(`${BULLETIN_CATEGORY_EDU_API_ENDPOINT}/${name}`);
      return response.data.exists;
    } catch (error) {
      return false;
    }
  },

  updateCategory: async (id: string, category: CreateBulletinCategoryDto) => {
    set({ isLoading: true });
    try {
      await eduApi.patch(`${BULLETIN_CATEGORY_EDU_API_ENDPOINT}/${id}`, category);
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
      await eduApi.delete(`${BULLETIN_CATEGORY_EDU_API_ENDPOINT}/${id}`);
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
