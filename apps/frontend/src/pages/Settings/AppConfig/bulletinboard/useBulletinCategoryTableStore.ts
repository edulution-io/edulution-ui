import { create, StoreApi, UseBoundStore } from 'zustand';
import eduApi from '@/api/eduApi';
import { BULLETIN_CATEGORY_EDU_API_ENDPOINT } from '@libs/bulletinBoard/constants/apiEndpoints';
import BulletinCategoryResponseDto from '@libs/bulletinBoard/types/bulletinCategoryResponseDto';
import handleApiError from '@/utils/handleApiError';
import { toast } from 'sonner';
import i18n from '@/i18n';
import { BulletinCategoryTableStore } from '@libs/appconfig/types/bulletinCategoryTableStore';

const initialValues = {
  isDialogOpen: false,
  isLoading: true,
  selectedCategory: null,
  isBulletinCategoryDialogOpen: false,
  isNameCheckingLoading: false,
  tableContentData: [],
  nameExistsAlready: false,
};

const useBulletinCategoryTableStore: UseBoundStore<StoreApi<BulletinCategoryTableStore>> =
  create<BulletinCategoryTableStore>((set) => ({
    ...initialValues,
    setNameCheckingIsLoading: (isNameCheckingLoading) => set({ isNameCheckingLoading }),
    setNameAllReadyExists: (nameExistsAlready) => set({ nameExistsAlready }),
    setIsLoading: (isLoading) => set({ isLoading }),
    setIsDialogOpen: (isOpen) => set({ isDialogOpen: isOpen }),
    setEditBulletinCategoryDialogOpen: (isOpen) => set({ isBulletinCategoryDialogOpen: isOpen }),

    addNewCategory: async (category) => {
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
      } catch (error) {
        handleApiError(error, set);
      } finally {
        set({ isLoading: false });
      }
    },

    checkIfNameAllReadyExists: async (name): Promise<void> => {
      try {
        set({ isNameCheckingLoading: true });
        const response = await eduApi.post<{ exists: boolean }>(`${BULLETIN_CATEGORY_EDU_API_ENDPOINT}/${name}`);
        set({ nameExistsAlready: response.data.exists });
      } catch (error) {
        set({ nameExistsAlready: true });
      } finally {
        set({ isNameCheckingLoading: false });
      }
    },

    updateCategory: async (id, category) => {
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

    deleteCategory: async (id) => {
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

export default useBulletinCategoryTableStore;
