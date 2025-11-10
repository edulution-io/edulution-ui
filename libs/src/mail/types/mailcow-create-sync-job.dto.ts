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

// This DTO is based on a third-party object definition from mailcow https://mailcow.docs.apiary.io/#reference/sync-jobs/create-sync-job/create-sync-job.
// Any modifications should be carefully reviewed to ensure compatibility with the source.

import TMailEncryption from './mailEncryption.type';

type CreateSyncJobDto = {
  username: string;
  delete2duplicates: number;
  delete1: number;
  delete2: number;
  automap: number;
  skipcrossduplicates: number;
  active: number;
  subscribeall: number;
  host1: string;
  port1: string;
  user1: string;
  password1: string;
  enc1: TMailEncryption;
  mins_interval: number;
  subfolder2: string;
  maxage: number;
  maxbytespersecond: number;
  timeout1: number;
  timeout2: number;
  exclude: string;
};

export default CreateSyncJobDto;
