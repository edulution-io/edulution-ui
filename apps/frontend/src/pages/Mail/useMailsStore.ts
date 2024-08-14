import { create } from 'zustand';
import { MailDto, MailsStore, MailProviderConfigDto, CreateSyncJobDto, SyncJobDto } from '@libs/mail/types';
import MAIL_ENDPOINT from '@libs/mail/constants/mail-endpoint';
import eduApi from '@/api/eduApi';
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
      const response = await eduApi.get<MailDto[]>(MAIL_ENDPOINT);
      const mails = response.data;
      set({ mails });
    } catch (error) {
      set({ mails: [] });
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
    set({ isLoading: true });
    try {
      const response = await eduApi.get<SyncJobDto[]>(`${MAILS_PATH}/sync-job`);
      set({ syncJobs: response.data });
    } catch (error) {
      handleApiError(error, set, 'mailProviderConfigError');
    } finally {
      set({ isLoading: false });
    }
  },

  postSyncJob: async (createSyncJobDto: CreateSyncJobDto) => {
    set({ isLoading: true });
    try {
      const response = await eduApi.post<SyncJobDto[]>(`${MAILS_PATH}/sync-job`, createSyncJobDto);
      set({ syncJobs: response.data });
    } catch (error) {
      handleApiError(error, set, 'mailProviderConfigError');
    } finally {
      set({ isLoading: false });
    }
  },

  deleteSyncJobs: async (syncJobIds: string[]) => {
    set({ isLoading: true });
    try {
      const response = await eduApi.delete<SyncJobDto[]>(`${MAILS_PATH}/sync-job`, { data: syncJobIds });
      set({ syncJobs: response.data });
    } catch (error) {
      handleApiError(error, set, 'mailProviderConfigError');
    } finally {
      set({ isLoading: false });
    }
  },
}));

export default useMailsStore;
