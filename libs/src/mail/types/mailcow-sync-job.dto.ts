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

// This DTO is based on a third-party object definition from mailcow https://mailcow.docs.apiary.io/#reference/sync-jobs/create-sync-job/create-sync-job.
// Any modifications should be carefully reviewed to ensure compatibility with the source.

import TMailEncryption from './mailEncryption.type';

type SyncJobDto = {
  id: number;
  user1: string;
  host1: string;
  authmech1: string;
  user2: string;
  exclude: string;
  maxage: number;
  mins_interval: number;
  maxbytespersecond: number;
  port1: number;
  enc1: TMailEncryption;
  delete2duplicates: number;
  delete1: number;
  delete2: number;
  automap: number;
  skipcrossduplicates: number;
  timeout1: number;
  timeout2: number;
  subscribeall: number;
  dry: number;
  is_running: number;
  last_run: string;
  success: number;
  exit_status: string;
  created: string;
  modified: string;
  active: number;
  log: string;
};

export default SyncJobDto;
