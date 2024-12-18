import { RowSelectionState } from '@tanstack/react-table';
import MailDto from '@libs/mail/types/mail.dto';
import MailProviderConfigDto from './mailProviderConfig.dto';
import CreateSyncJobDto from './mailcow-create-sync-job.dto';
import SyncJobDto from './mailcow-sync-job.dto';

interface MailsStore {
  mails: MailDto[];
  getMails: () => Promise<void>;
  externalMailProviderConfig: MailProviderConfigDto[];
  getExternalMailProviderConfig: () => Promise<void>;
  postExternalMailProviderConfig: (mailProviderConfig: MailProviderConfigDto) => Promise<void>;
  deleteExternalMailProviderConfig: (mailProviderId: string) => Promise<void>;
  error: Error | null;
  isLoading: boolean;
  isGetSyncJobLoading: boolean;
  isEditSyncJobLoading: boolean;
  reset: () => void;
  selectedSyncJob: RowSelectionState;
  setSelectedSyncJob: (selectedSyncJob: RowSelectionState) => void;
  syncJobs: SyncJobDto[];
  getSyncJob: () => Promise<void>;
  postSyncJob: (createSyncJobDto: CreateSyncJobDto) => Promise<void>;
  deleteSyncJobs: (syncJobIds: string[]) => Promise<void>;
}

export default MailsStore;
