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
