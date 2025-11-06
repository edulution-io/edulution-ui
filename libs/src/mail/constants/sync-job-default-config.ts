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
