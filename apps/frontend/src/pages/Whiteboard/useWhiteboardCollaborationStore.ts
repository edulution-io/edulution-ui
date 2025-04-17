import { create } from 'zustand';
import eduApi from '@/api/eduApi';
import { toast } from 'sonner';
import i18n from '@/i18n';
import handleApiError from '@/utils/handleApiError';
import TLDRAW_SYNC_ENDPOINTS from '@libs/tldraw-sync/constants/apiEndpoints';
import { JsonObject } from 'tldraw';

type UseWhiteboardCollaborationStore = {
  error: Error | null;
  uploadAsset: (assetId: string, data: File) => Promise<{ meta?: JsonObject | undefined; src: string }>;
  isUploadAssetLoading: boolean;
  getAssetUrl: (assetId: string) => Promise<string>;
  isGetAssetLoading: boolean;
};

const initialState = {
  error: null,
  isUploadAssetLoading: false,
  isGetAssetLoading: false,
};

const useWhiteboardCollaborationStore = create<UseWhiteboardCollaborationStore>((set) => ({
  ...initialState,

  getAssetUrl: async (assetId) => {
    set({ isGetAssetLoading: true });
    try {
      const response = await eduApi.get<string>(
        `${TLDRAW_SYNC_ENDPOINTS.BASE}/${TLDRAW_SYNC_ENDPOINTS.ASSETS}/${assetId}`,
      );
      toast.success(i18n.t('conferences.conferenceUpdatedSuccessfully')); // TODO

      return response.data;
    } catch (error) {
      handleApiError(error, set);
      return '';
    } finally {
      set({ isGetAssetLoading: false });
    }
  },

  uploadAsset: async (assetId, data) => {
    set({ isUploadAssetLoading: true });
    try {
      const response = await eduApi.put<{ meta?: JsonObject | undefined; src: string }>(
        `${TLDRAW_SYNC_ENDPOINTS.BASE}/${TLDRAW_SYNC_ENDPOINTS.ASSETS}/${assetId}`,
        data,
      );
      toast.success(i18n.t('conferences.conferenceUpdatedSuccessfully')); // TODO

      return response.data;
    } catch (error) {
      handleApiError(error, set);
      return { meta: undefined, src: '' };
    } finally {
      set({ isUploadAssetLoading: false });
    }
  },
}));

export default useWhiteboardCollaborationStore;
