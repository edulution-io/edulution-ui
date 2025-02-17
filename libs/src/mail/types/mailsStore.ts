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
