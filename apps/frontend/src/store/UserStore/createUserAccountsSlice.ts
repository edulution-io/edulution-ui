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
import UserStore from '@libs/user/types/store/userStore';
import UserAccountDto from '@libs/user/types/userAccount.dto';
import { EDU_API_USERS_ENDPOINT, EDU_API_USER_ACCOUNTS_ENDPOINT } from '@libs/user/constants/usersApiEndpoints';
import type UserAccountsSlice from '@libs/user/types/store/userAccountsSlice';

const initialState = {
  userAccounts: [],
  userAccountsIsLoading: false,
  selectedRows: {},
};

const createUserAccountsSlice: StateCreator<UserStore, [], [], UserAccountsSlice> = (set, get) => ({
  ...initialState,

  setSelectedRows: (selectedRows) => set({ selectedRows }),

  getUserAccounts: async () => {
    if (get().user?.username === undefined) return;
    set({ userAccountsIsLoading: true });
    try {
      const { data } = await eduApi.get<UserAccountDto[]>(
        `${EDU_API_USERS_ENDPOINT}/${get().user?.username}/${EDU_API_USER_ACCOUNTS_ENDPOINT}`,
      );
      set({ userAccounts: data });
    } catch (e) {
      handleApiError(e, set);
    } finally {
      set({ userAccountsIsLoading: false });
    }
  },

  addUserAccount: async (userAccountDto) => {
    set({ userAccountsIsLoading: true });
    try {
      const { data } = await eduApi.post<UserAccountDto[]>(
        `${EDU_API_USERS_ENDPOINT}/${get().user?.username}/${EDU_API_USER_ACCOUNTS_ENDPOINT}`,
        userAccountDto,
      );
      set({ userAccounts: data });
    } catch (e) {
      handleApiError(e, set);
    } finally {
      set({ userAccountsIsLoading: false });
    }
  },

  updateUserAccount: async (accountId, userAccountDto) => {
    set({ userAccountsIsLoading: true });
    try {
      const { data } = await eduApi.patch<UserAccountDto[]>(
        `${EDU_API_USERS_ENDPOINT}/${get().user?.username}/${EDU_API_USER_ACCOUNTS_ENDPOINT}/${accountId}`,
        userAccountDto,
      );
      set({ userAccounts: data });
    } catch (e) {
      handleApiError(e, set);
    } finally {
      set({ userAccountsIsLoading: false });
    }
  },

  deleteUserAccount: async (accountId) => {
    set({ userAccountsIsLoading: true });
    try {
      const { data } = await eduApi.delete<UserAccountDto[]>(
        `${EDU_API_USERS_ENDPOINT}/${get().user?.username}/${EDU_API_USER_ACCOUNTS_ENDPOINT}/${accountId}`,
      );
      set({ userAccounts: data });
    } catch (e) {
      handleApiError(e, set);
    } finally {
      set({ userAccountsIsLoading: false });
    }
  },

  resetUserAccountsSlice: () => set({ ...initialState }),
});

export default createUserAccountsSlice;
