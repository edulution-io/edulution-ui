import { create, StoreApi, UseBoundStore } from 'zustand';
import eduApi from '@/api/eduApi';
import { BULLETIN_CATEGORY_EDU_API_ENDPOINT } from '@libs/bulletinBoard/constants/apiEndpoints';
import BulletinCategoryResponseDto from '@libs/bulletinBoard/types/bulletinCategoryResponseDto';
import handleApiError from '@/utils/handleApiError';
import { toast } from 'sonner';
import i18n from '@/i18n';
import { BulletinBoardTableStore } from '@libs/appconfig/types/bulletinBoardTableStore';
import BulletinCategoryPermission from '@libs/appconfig/constants/bulletinCategoryPermission';

const initialValues = {
  isDialogOpen: false,
  isLoading: false,
  selectedCategory: null,
  isNameAvailable: false,
  isNameChecking: false,
  tableContentData: [],
  nameExists: null,
  isDeleteDialogOpen: false,
  isDeleteDialogLoading: false,
  error: null,
};

const useAppConfigBulletinTableStore: UseBoundStore<StoreApi<BulletinBoardTableStore>> =
  create<BulletinBoardTableStore>((set, get) => ({
    ...initialValues,
    setIsNameChecking: (isNameChecking) => set({ isNameChecking }),
    setNameExists: (nameExists) => set({ nameExists }),
    setIsLoading: (isLoading) => set({ isLoading }),
    setIsDialogOpen: (isOpen) => set({ isDialogOpen: isOpen }),
    setIsDeleteDialogOpen: (isOpen) => set({ isDeleteDialogOpen: isOpen }),

    addNewCategory: async (category) => {
      set({ error: null, isLoading: true });
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
      if (get().isLoading) {
        return [];
      }

      set({ error: null, isLoading: true });
      try {
        const response = await eduApi.get<BulletinCategoryResponseDto[]>(
          `${BULLETIN_CATEGORY_EDU_API_ENDPOINT}/${BulletinCategoryPermission.EDIT}`,
        );
        set({ tableContentData: response.data });
        return response.data || [];
      } catch (error) {
        handleApiError(error, set);
        return [];
      } finally {
        set({ isLoading: false });
      }
    },

    checkIfNameExists: async (name): Promise<boolean> => {
      try {
        const response = await eduApi.post<{ exists: boolean }>(`${BULLETIN_CATEGORY_EDU_API_ENDPOINT}/${name}`);
        return response.data.exists;
      } catch (error) {
        return false;
      }
    },

    updateCategory: async (id, category) => {
      set({ error: null, isLoading: true });
      try {
        await eduApi.patch(`${BULLETIN_CATEGORY_EDU_API_ENDPOINT}/${id}`, category);
        toast.success(i18n.t('bulletinboard.categoryUpdatedSuccessfully'));
      } catch (error) {
        handleApiError(error, set);
      } finally {
        set({ isLoading: false });
      }
    },

    deleteCategory: async (id) => {
      set({ error: null, isDeleteDialogLoading: true });
      try {
        await eduApi.delete(`${BULLETIN_CATEGORY_EDU_API_ENDPOINT}/${id}`);
        toast.success(i18n.t('bulletinboard.categoryDeletedSuccessfully'));
      } catch (error) {
        handleApiError(error, set);
      } finally {
        set({ isDeleteDialogLoading: false });
      }
    },

    reset: () => set(initialValues),
  }));

export default useAppConfigBulletinTableStore;
