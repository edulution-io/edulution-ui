import MailDto from '@libs/mail/types/mail.dto';
import MailProviderConfigDto from './mailProviderConfig.dto';
import CreateSyncJobDto from './mailcow-create-sync-job.dto';
import CreateSyncJobResponseDto from './mailcow-create-sync-job-response.dto';
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
  reset: () => void;
  getSyncJob: () => Promise<SyncJobDto>;
  postSyncJob: (createSyncJobDto: CreateSyncJobDto) => Promise<CreateSyncJobResponseDto>;
}

export default MailsStore;
