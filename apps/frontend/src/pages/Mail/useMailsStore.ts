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
import { MailDto, MailsStore, MailProviderConfigDto, CreateSyncJobDto, SyncJobDto } from '@libs/mail/types';
import MAIL_ENDPOINT from '@libs/mail/constants/mail-endpoint';
import eduApi from '@libs/common/constants/eduApi';
import handleApiError from '@/utils/handleApiError';
import MailStoreInitialState from '@libs/mail/constants/mailsStoreInitialState';
import { MAILS_PATH } from '@libs/userSettings/constants/user-settings-endpoints';
import { RowSelectionState } from '@tanstack/react-table';

const useMailsStore = create<MailsStore>((set) => ({
  ...MailStoreInitialState,
  reset: () => set(MailStoreInitialState),
  setSelectedSyncJob: (selectedSyncJob: RowSelectionState) => set({ selectedSyncJob }),

  getMails: async (): Promise<void> => {
    set({ isLoading: true });
    try {
      const { data } = await eduApi.get<MailDto[]>(MAIL_ENDPOINT);
      set({ mails: data });
    } catch (error) {
      handleApiError(error, set);
    } finally {
      set({ isLoading: false });
    }
  },

  getExternalMailProviderConfig: async () => {
    set({ isLoading: true });
    try {
      const response = await eduApi.get<MailProviderConfigDto[]>(`${MAILS_PATH}/provider-config`);
      set({ externalMailProviderConfig: response.data });
    } catch (error) {
      handleApiError(error, set, 'mailProviderConfigError');
    } finally {
      set({ isLoading: false });
    }
  },

  postExternalMailProviderConfig: async (mailProviderConfig: MailProviderConfigDto) => {
    set({ isLoading: true });
    try {
      const response = await eduApi.post<MailProviderConfigDto[]>(`${MAILS_PATH}/provider-config`, mailProviderConfig);
      set({ externalMailProviderConfig: response.data });
    } catch (error) {
      handleApiError(error, set, 'mailProviderConfigError');
    } finally {
      set({ isLoading: false });
    }
  },

  deleteExternalMailProviderConfig: async (mailProviderId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await eduApi.delete<MailProviderConfigDto[]>(`${MAILS_PATH}/provider-config/${mailProviderId}`);
      set({ externalMailProviderConfig: response.data });
    } catch (e) {
      handleApiError(e, set, 'mailProviderConfigError');
    } finally {
      set({ isLoading: false });
    }
  },

  getSyncJob: async () => {
    set({ isGetSyncJobLoading: true });
    try {
      const response = await eduApi.get<SyncJobDto[]>(`${MAILS_PATH}/sync-job`);
      set({ syncJobs: response.data });
    } catch (error) {
      handleApiError(error, set, 'mailProviderConfigError');
    } finally {
      set({ isGetSyncJobLoading: false });
    }
  },

  postSyncJob: async (createSyncJobDto: CreateSyncJobDto) => {
    set({ isEditSyncJobLoading: true });
    try {
      const response = await eduApi.post<SyncJobDto[]>(`${MAILS_PATH}/sync-job`, createSyncJobDto);
      set({ syncJobs: response.data });
    } catch (error) {
      handleApiError(error, set, 'mailProviderConfigError');
    } finally {
      set({ isEditSyncJobLoading: false });
    }
  },

  deleteSyncJobs: async (syncJobIds: string[]) => {
    set({ isEditSyncJobLoading: true });
    try {
      const response = await eduApi.delete<SyncJobDto[]>(`${MAILS_PATH}/sync-job`, { data: syncJobIds });
      set({ syncJobs: response.data });
    } catch (error) {
      handleApiError(error, set, 'mailProviderConfigError');
    } finally {
      set({ isEditSyncJobLoading: false });
    }
  },
}));

export default useMailsStore;
