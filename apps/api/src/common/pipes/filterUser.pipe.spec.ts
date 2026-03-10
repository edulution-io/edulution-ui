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

import { SyncJobDto } from '@libs/mail/types';
import FilterUserPipe from './filterUser.pipe';

const createSyncJob = (user2: string): SyncJobDto =>
  ({
    id: 1,
    user1: 'source@example.com',
    host1: 'imap.example.com',
    authmech1: 'PLAIN',
    user2,
    exclude: '',
    maxage: 0,
    mins_interval: 20,
    maxbytespersecond: 0,
    port1: 993,
    enc1: 'SSL',
    delete2duplicates: 0,
    delete1: 0,
    delete2: 0,
    automap: 1,
    skipcrossduplicates: 0,
    timeout1: 600,
    timeout2: 600,
    subscribeall: 1,
    dry: 0,
    is_running: 0,
    last_run: '2025-01-01',
    success: 1,
    exit_status: '',
    created: '2025-01-01',
    modified: '2025-01-01',
    active: 1,
    log: '',
  }) as SyncJobDto;

describe(FilterUserPipe.name, () => {
  const targetEmail = 'lehrer.mueller@schule.de';
  let pipe: FilterUserPipe;

  beforeEach(() => {
    pipe = new FilterUserPipe(targetEmail);
  });

  it('should return only sync jobs matching the user2 email', () => {
    const jobs = [createSyncJob(targetEmail), createSyncJob('other@schule.de'), createSyncJob(targetEmail)];

    const result = pipe.transform(jobs, { type: 'body' });
    expect(result).toHaveLength(2);
    expect(result.every((job: SyncJobDto) => job.user2 === targetEmail)).toBe(true);
  });

  it('should return an empty array when no jobs match', () => {
    const jobs = [createSyncJob('other@schule.de'), createSyncJob('another@schule.de')];

    const result = pipe.transform(jobs, { type: 'body' });
    expect(result).toEqual([]);
  });

  it('should return an empty array for an empty input array', () => {
    const result = pipe.transform([], { type: 'body' });
    expect(result).toEqual([]);
  });

  it('should return an empty array for non-array input', () => {
    const result = pipe.transform('not-an-array' as unknown as SyncJobDto[], { type: 'body' });
    expect(result).toEqual([]);
  });

  it('should return an empty array for null input', () => {
    const result = pipe.transform(null as unknown as SyncJobDto[], { type: 'body' });
    expect(result).toEqual([]);
  });

  it('should return all jobs when all match the user', () => {
    const jobs = [createSyncJob(targetEmail), createSyncJob(targetEmail)];

    const result = pipe.transform(jobs, { type: 'body' });
    expect(result).toHaveLength(2);
  });
});
