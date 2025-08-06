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

import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';
import { StateCreator } from 'zustand';
import QrCodeSlice from '@libs/user/types/store/qrCodeSlice';
import UserStore from '@libs/user/types/store/userStore';
import AUTH_PATHS from '@libs/auth/constants/auth-paths';
import { decodeBase64 } from '@libs/common/utils/getBase64String';

const initialState = {
  qrCode: '',
  qrCodeIsLoading: false,
  qrCodeError: null,
};

const createQrCodeSlice: StateCreator<UserStore, [], [], QrCodeSlice> = (set) => ({
  ...initialState,

  getQrCode: async () => {
    set({ qrCodeIsLoading: true });
    try {
      const { data } = await eduApi.get<string>(`${AUTH_PATHS.AUTH_ENDPOINT}/${AUTH_PATHS.AUTH_QRCODE}`);
      set({ qrCode: decodeBase64(data) });
    } catch (e) {
      handleApiError(e, set);
    } finally {
      set({ qrCodeIsLoading: false });
    }
  },

  resetQrCodeSlice: () => set({ ...initialState }),
});

export default createQrCodeSlice;
