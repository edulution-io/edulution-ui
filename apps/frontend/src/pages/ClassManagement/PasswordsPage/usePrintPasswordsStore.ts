import { create } from 'zustand';
import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';
import useLmnApiStore from '@/store/useLmnApiStore';
import LMN_API_EDU_API_ENDPOINTS from '@libs/lmnApi/constants/eduApiEndpoints';
import PrintPasswordsStore from '@libs/classManagement/types/store/printPasswordsStore';
import PrintPasswordsRequest from '@libs/classManagement/types/printPasswordsRequest';
import { HTTP_HEADERS } from '@libs/common/types/http-methods';

const initialState = {
  isLoading: false,
  error: null,
};

const usePrintPasswordsStore = create<PrintPasswordsStore>((set) => ({
  ...initialState,

  printPasswords: async (options: PrintPasswordsRequest) => {
    set({ error: null, isLoading: true });
    try {
      const { lmnApiToken } = useLmnApiStore.getState();
      const response = await eduApi.post<Blob>(
        LMN_API_EDU_API_ENDPOINTS.PRINT_PASSWORDS,
        {
          options,
        },
        {
          headers: { [HTTP_HEADERS.XApiKey]: lmnApiToken },
          responseType: 'blob',
        },
      );

      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;

      const filename = `${options.schoolclasses.join('-')}-${options.school}-passwords.${options.format}`;
      link.setAttribute('download', filename);

      document.body.appendChild(link);
      link.click();

      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      handleApiError(error, set);
    } finally {
      set({ isLoading: false });
    }
  },

  reset: () => set({ ...initialState }),
}));

export default usePrintPasswordsStore;
