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

import { create } from 'zustand';
import eduApi from '@/api/eduApi';
import USER_PREFERENCES_ENDPOINT from '@libs/user-preferences/constants/user-preferences-endpoint';
import UserPreferencesDto from '@libs/user-preferences/types/user-preferences.dto';
import handleApiError from '@/utils/handleApiError';

interface UserPreferencesStore {
  isLoading: boolean;
  error: Error | null;
  preferences: UserPreferencesDto | null;
  getUserPreferences: (fields: string[]) => Promise<UserPreferencesDto | null>;
}

const useUserPreferencesStore = create<UserPreferencesStore>((set) => ({
  isLoading: false,
  error: null,
  preferences: null,

  getUserPreferences: async (fields) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await eduApi.get<UserPreferencesDto>(`${USER_PREFERENCES_ENDPOINT}?fields=${fields.join(',')}`);
      set({ preferences: data, isLoading: false });

      return data;
    } catch (error) {
      handleApiError(error, set);
      return null;
    } finally {
      set({ isLoading: false });
    }
  },
}));

export default useUserPreferencesStore;
