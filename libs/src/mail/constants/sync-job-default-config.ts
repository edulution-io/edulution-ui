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

import { CreateSyncJobDto } from '../types';
import MailEncryption from './mailEncryption';

const syncjobDefaultConfig: CreateSyncJobDto = {
  username: '',
  host1: '',
  port1: '',
  user1: '',
  password1: '',
  enc1: MailEncryption.SSL,
  subfolder2: '',
  delete2duplicates: 1,
  delete1: 0,
  delete2: 0,
  automap: 1,
  skipcrossduplicates: 0,
  active: 1,
  subscribeall: 1,
  mins_interval: 15,
  maxage: 0,
  maxbytespersecond: 0,
  timeout1: 600,
  timeout2: 600,
  exclude: '(?i)spam|(?i)junk',
};

export default syncjobDefaultConfig;
