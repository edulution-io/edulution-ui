/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
 *
 * This software is dual-licensed under the terms of:
 *
 * 1. The GNU Affero General Public License (AGPL-3.0-or-later), as published by the Free Software Foundation.
 *    You may use, modify and distribute this software under the terms of the AGPL, provided that you comply with its conditions.
 *
 *    A copy of the license can be found at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * OR
 *
 * 2. A commercial license agreement with Netzint GmbH. Licensees holding a valid commercial license from Netzint GmbH
 *    may use this software in accordance with the terms contained in such written agreement, without the obligations imposed by the AGPL.
 *
 * If you are uncertain which license applies to your use case, please contact us at info@netzint.de for clarification.
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
