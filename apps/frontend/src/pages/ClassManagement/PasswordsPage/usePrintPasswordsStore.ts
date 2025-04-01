/*
 * LICENSE
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import { create } from 'zustand';
import eduApi from '@libs/common/constants/eduApi';
import handleApiError from '@/utils/handleApiError';
import useLmnApiStore from '@/store/useLmnApiStore';
import LMN_API_EDU_API_ENDPOINTS from '@libs/lmnApi/constants/eduApiEndpoints';
import PrintPasswordsStore from '@libs/classManagement/types/store/printPasswordsStore';
import PrintPasswordsRequest from '@libs/classManagement/types/printPasswordsRequest';
import { HTTP_HEADERS, ResponseType } from '@libs/common/types/http-methods';

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
          responseType: ResponseType.BLOB,
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
