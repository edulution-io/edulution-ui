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

import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2, EventEmitterModule } from '@nestjs/event-emitter';
import { Queue as BullQueue, Worker as BullWorker } from 'bullmq';
import QUEUE_CONSTANTS from '@libs/queue/constants/queueConstants';
import JOB_NAMES from '@libs/queue/constants/jobNames';
import USERS_CACHE_UPDATE_LIMIT from '@libs/user/constants/usersCacheUpdateLimit';
import UsersCacheQueue from './users-cache.queue';
import UsersService from '../users.service';

jest.mock('bullmq', () => ({
  Queue: jest.fn().mockImplementation((name: string, opts: unknown) => ({
    name,
    opts,
    add: jest.fn(),
    close: jest.fn(),
  })),
  Worker: jest.fn().mockImplementation((name: string, processor: unknown, opts: unknown) => ({
    name,
    processor,
    opts,
    close: jest.fn(),
  })),
}));

const BullQueueMock = BullQueue as unknown as jest.Mock;
const BullWorkerMock = BullWorker as unknown as jest.Mock;

type Internals = {
  queue: { add: jest.Mock; close: jest.Mock };
  worker: { close: jest.Mock };
};

describe('UsersCacheQueue', () => {
  let module: TestingModule;
  let queueSvc: UsersCacheQueue;
  let usersServiceMock: { refreshUsersCache: jest.Mock };
  let eventEmitter: EventEmitter2;

  beforeEach(async () => {
    usersServiceMock = { refreshUsersCache: jest.fn() };

    module = await Test.createTestingModule({
      imports: [EventEmitterModule.forRoot()],
      providers: [UsersCacheQueue, { provide: UsersService, useValue: usersServiceMock }],
    }).compile();

    queueSvc = module.get(UsersCacheQueue);
    eventEmitter = module.get(EventEmitter2);

    await module.init();
    queueSvc.onModuleInit();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a Queue and a Worker on init with correct options', () => {
    expect(BullQueueMock).toHaveBeenCalledWith(
      QUEUE_CONSTANTS.USERS_CACHE_REFRESH,
      expect.objectContaining({
        connection: {
          host: process.env.REDIS_HOST ?? 'localhost',
          port: +(process.env.REDIS_PORT ?? 6379),
        },
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        defaultJobOptions: expect.any(Object),
      }),
    );

    expect(BullWorkerMock).toHaveBeenCalledWith(
      QUEUE_CONSTANTS.USERS_CACHE_REFRESH,
      expect.any(Function),
      expect.objectContaining({
        connection: {
          host: process.env.REDIS_HOST ?? 'localhost',
          port: +(process.env.REDIS_PORT ?? 6379),
        },
        limiter: {
          max: 1,
          duration: USERS_CACHE_UPDATE_LIMIT,
        },
      }),
    );
  });

  it('should enqueue a job when scheduleRefresh is called', async () => {
    const svc = queueSvc as unknown as Internals;
    await queueSvc.scheduleRefresh();
    expect(svc.queue.add).toHaveBeenCalledWith(
      JOB_NAMES.REFRESH_USERS_IN_CACHE,
      {},
      { jobId: JOB_NAMES.REFRESH_USERS_IN_CACHE },
    );
  });

  it('should close both worker and queue on module destroy', async () => {
    const svc = queueSvc as unknown as Internals;
    await queueSvc.onModuleDestroy();
    expect(svc.worker.close).toHaveBeenCalled();
    expect(svc.queue.close).toHaveBeenCalled();
  });

  it('should bind the OnEvent listener to the EventEmitter2', () => {
    const listeners = eventEmitter.listeners(QUEUE_CONSTANTS.USERS_CACHE_REFRESH);
    expect(listeners.length).toBeGreaterThan(0);
    expect(listeners).toContainEqual(expect.any(Function));
  });
});
