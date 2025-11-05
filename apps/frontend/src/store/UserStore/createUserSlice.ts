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
import delay from '@libs/common/utils/delay';
import UserStore from '@libs/user/types/store/userStore';
import UserSlice from '@libs/user/types/store/userSlice';
import UserDto from '@libs/user/types/user.dto';
import AttendeeDto from '@libs/user/types/attendee.dto';
import { EDU_API_USERS_ENDPOINT, EDU_API_USERS_SEARCH_ENDPOINT } from '@libs/user/constants/usersApiEndpoints';
import UserLanguageType from '@libs/user/types/userLanguageType';
import { decodeBase64 } from '@libs/common/utils/getBase64String';

const initialState = {
  isAuthenticated: false,
  isPreparingLogout: false,
  eduApiToken: '',
  user: null,
  userError: null,
  userIsLoading: false,
  searchError: null,
  searchIsLoading: false,
};

const createUserSlice: StateCreator<UserStore, [], [], UserSlice> = (set, get) => ({
  ...initialState,

  setEduApiToken: (eduApiToken) => set({ eduApiToken }),

  getWebdavKey: async () => {
    set({ userIsLoading: true });
    try {
      const { data } = await eduApi.get<string>(`${EDU_API_USERS_ENDPOINT}/${get().user?.username}/key`);
      return decodeBase64(data);
    } catch (error) {
      handleApiError(error, set, 'userError');
      return '';
    } finally {
      set({ userIsLoading: false });
    }
  },

  logout: async () => {
    set({ isPreparingLogout: true });
    await delay(200);
    set({ isAuthenticated: false });
  },

  createOrUpdateUser: async (user: UserDto) => {
    set({ userIsLoading: true });
    try {
      const { data } = await eduApi.post<UserDto>(EDU_API_USERS_ENDPOINT, user);
      set({ user: data });
      return data;
    } catch (error) {
      handleApiError(error, set, 'userError');
      return undefined;
    } finally {
      set({ isAuthenticated: true, userIsLoading: false });
    }
  },

  getUser: async () => {
    set({ userIsLoading: true });
    try {
      const { data } = await eduApi.get<UserDto>(`${EDU_API_USERS_ENDPOINT}/${get().user?.username}`);
      set({ user: { ...data } });
    } catch (e) {
      handleApiError(e, set, 'userError');
    } finally {
      set({ userIsLoading: false });
    }
  },

  updateUser: async (userInfo) => {
    set({ userIsLoading: true });
    try {
      await eduApi.patch<UserDto>(`${EDU_API_USERS_ENDPOINT}/${get().user?.username}`, userInfo);
    } catch (error) {
      handleApiError(error, set, 'userError');
    } finally {
      set({ userIsLoading: false });
    }
  },

  searchAttendees: async (searchParam) => {
    set({ searchError: null, searchIsLoading: true });
    try {
      const response = await eduApi.get<AttendeeDto[]>(`${EDU_API_USERS_SEARCH_ENDPOINT}/${searchParam}`);

      if (!Array.isArray(response.data)) {
        return [];
      }

      return response.data?.map((d) => ({
        ...d,
        value: d.username,
        label: `${d.firstName} ${d.lastName} (${d.username})`,
      }));
    } catch (error) {
      handleApiError(error, set, 'searchError');
      return [];
    } finally {
      set({ searchIsLoading: false });
    }
  },

  updateUserLanguage: async (language: UserLanguageType): Promise<void> => {
    const currentUser = get().user;
    if (currentUser) {
      set({ user: { ...currentUser, language } });
      await get().updateUser({ language });
    }
  },

  resetUserSlice: () => set({ ...initialState }),
});

export default createUserSlice;
