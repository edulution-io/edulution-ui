import { create } from 'zustand';
import { RowSelectionState } from '@tanstack/react-table';
import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';
import {
  BULLETIN_BOARD_BULLETINS_EDU_API_ENDPOINT,
  BULLETIN_BOARD_EDU_API_ENDPOINT,
  BULLETIN_BOARD_UPLOAD_EDU_API_ENDPOINT,
  BULLETIN_CATEGORY_WITH_PERMISSION_EDU_API_ENDPOINT,
} from '@libs/bulletinBoard/constants/apiEndpoints';
import BulletinResponseDto from '@libs/bulletinBoard/types/bulletinResponseDto';
import CreateBulletinDto from '@libs/bulletinBoard/types/createBulletinDto';
import BulletinCategoryResponseDto from '@libs/bulletinBoard/types/bulletinCategoryResponseDto';
import BulletinCategoryPermission from '@libs/appconfig/constants/bulletinCategoryPermission';
import { toast } from 'sonner';
import i18n from '@/i18n';

interface BulletinBoardEditorialStore {
  selectedRows: RowSelectionState;
  setSelectedRows: (selectedRows: RowSelectionState) => void;
  bulletins: BulletinResponseDto[];
  selectedBulletinToEdit: BulletinResponseDto | null;
  setSelectedBulletinToEdit: (bulletin: BulletinResponseDto | null) => void;
  updateBulletin: (id: string, bulletin: Partial<CreateBulletinDto>) => Promise<void>;
  isLoading: boolean;
  error: Error | null;
  getBulletins: (isLoading?: boolean) => Promise<void>;
  deleteBulletins: (bulletins: BulletinResponseDto[]) => Promise<void>;
  isDeleteBulletinDialogOpen: boolean;
  setIsDeleteBulletinDialogOpen: (isOpen: boolean) => void;
  createBulletin: (bulletin: CreateBulletinDto) => Promise<void>;
  isCreateBulletinDialogOpen: boolean;
  setIsCreateBulletinDialogOpen: (isOpen: boolean) => void;
  isDialogLoading: boolean;
  uploadAttachment: (attachment: File) => Promise<string>;
  isAttachmentUploadLoading: boolean;
  categories: BulletinCategoryResponseDto[];
  getCategories: () => Promise<void>;
  isGetCategoriesLoading: boolean;
  reset: () => void;
}

const initialValues = {
  bulletins: [],
  categories: [],
  selectedBulletinToEdit: null,
  isLoading: false,
  error: null,
  selectedRows: {},
  isDeleteBulletinDialogOpen: false,
  isCreateBulletinDialogOpen: false,
  isDialogLoading: false,
  isAttachmentUploadLoading: false,
  isGetCategoriesLoading: false,
};

const useBulletinBoardEditorialStore = create<BulletinBoardEditorialStore>((set, get) => ({
  ...initialValues,

  setSelectedRows: (selectedRows: RowSelectionState) => set({ selectedRows }),

  setSelectedBulletinToEdit: (selectedBulletinToEdit) => set({ selectedBulletinToEdit }),

  getBulletins: async (isLoading = true) => {
    set({ isLoading, error: null });
    try {
      const { data } = await eduApi.get<BulletinResponseDto[]>(BULLETIN_BOARD_BULLETINS_EDU_API_ENDPOINT);
      set({ bulletins: data });
    } catch (error) {
      handleApiError(error, set);
    } finally {
      set({ isLoading: false });
    }
  },

  setIsDeleteBulletinDialogOpen: (isOpen) => set({ isDeleteBulletinDialogOpen: isOpen }),
  deleteBulletins: async (bulletins: BulletinResponseDto[]) => {
    set({ isDialogLoading: true, error: null });
    try {
      await eduApi.delete<BulletinResponseDto[]>(BULLETIN_BOARD_EDU_API_ENDPOINT, {
        data: bulletins.map((c) => c.id),
      });

      set({
        bulletins: get().bulletins.filter((item) => !bulletins.some((b) => b.id === item.id)),
        selectedRows: {},
      });
      toast.success(i18n.t('bulletinboard.bulletinsDeletedSuccessfully'));
    } catch (error) {
      handleApiError(error, set);
    } finally {
      set({ isDialogLoading: false });
    }
  },

  setIsCreateBulletinDialogOpen: (isOpen) => set({ isCreateBulletinDialogOpen: isOpen }),
  createBulletin: async (bulletin) => {
    set({ isDialogLoading: true, error: null });
    try {
      const { data } = await eduApi.post<BulletinResponseDto>(BULLETIN_BOARD_EDU_API_ENDPOINT, bulletin);

      set({ bulletins: [...get().bulletins, data], selectedRows: {} });
      toast.success(i18n.t('bulletinboard.bulletinCreatedSuccessfully'));
    } catch (error) {
      handleApiError(error, set);
    } finally {
      set({ isDialogLoading: false });
    }
  },

  updateBulletin: async (id, bulletin) => {
    set({ isDialogLoading: true, error: null });
    try {
      const { data } = await eduApi.patch<BulletinResponseDto>(`${BULLETIN_BOARD_EDU_API_ENDPOINT}/${id}`, bulletin);

      set({ bulletins: [...get().bulletins.filter((item) => item.id !== id), data], selectedRows: {} });
      toast.success(i18n.t('bulletinboard.bulletinUpdatedSuccessfully'));
    } catch (error) {
      handleApiError(error, set);
    } finally {
      set({ isDialogLoading: false });
    }
  },

  uploadAttachment: async (file): Promise<string> => {
    set({ isAttachmentUploadLoading: true, error: null });
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await eduApi.post<string>(BULLETIN_BOARD_UPLOAD_EDU_API_ENDPOINT, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      return response.data;
    } catch (error) {
      handleApiError(error, set);
      return '';
    } finally {
      set({ isAttachmentUploadLoading: false });
    }
  },

  getCategories: async () => {
    if (get().isGetCategoriesLoading) return;

    set({ error: null, isGetCategoriesLoading: true });
    try {
      const response = await eduApi.get<BulletinCategoryResponseDto[]>(
        `${BULLETIN_CATEGORY_WITH_PERMISSION_EDU_API_ENDPOINT}${BulletinCategoryPermission.EDIT}`,
      );
      set({ categories: response.data?.sort((a, b) => a.position - b.position) });
    } catch (error) {
      handleApiError(error, set);
    } finally {
      set({ isGetCategoriesLoading: false });
    }
  },

  reset: () => set(initialValues),
}));

export default useBulletinBoardEditorialStore;
