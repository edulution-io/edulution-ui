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

/* eslint-disable @typescript-eslint/dot-notation */
import { Test, TestingModule } from '@nestjs/testing';
import {
  HealthCheckService,
  MongooseHealthIndicator,
  HttpHealthIndicator,
  DiskHealthIndicator,
} from '@nestjs/terminus';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { SchedulerRegistry } from '@nestjs/schedule';
import HealthService from './health.service';
import WebdavSharesService from '../webdav/shares/webdav-shares.service';

describe(HealthService.name, () => {
  let service: HealthService;
  let healthCheckService: Record<string, jest.Mock>;

  beforeEach(async () => {
    healthCheckService = {
      check: jest.fn().mockResolvedValue({ status: 'ok', info: {}, details: {} }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HealthService,
        { provide: HealthCheckService, useValue: healthCheckService },
        {
          provide: MongooseHealthIndicator,
          useValue: { pingCheck: jest.fn().mockResolvedValue({ mongodb: { status: 'up' } }) },
        },
        {
          provide: HttpHealthIndicator,
          useValue: { pingCheck: jest.fn().mockResolvedValue({ authServer: { status: 'up' } }) },
        },
        {
          provide: DiskHealthIndicator,
          useValue: { checkStorage: jest.fn().mockResolvedValue({ disk: { status: 'up' } }) },
        },
        { provide: HttpService, useValue: {} },
        { provide: WebdavSharesService, useValue: { findAllWebdavServers: jest.fn().mockResolvedValue([]) } },
        { provide: ConfigService, useValue: { get: jest.fn().mockReturnValue('1.0.0') } },
        { provide: SchedulerRegistry, useValue: { addInterval: jest.fn() } },
      ],
    }).compile();

    service = module.get<HealthService>(HealthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should populate build info from config service', () => {
      service.onModuleInit();
      expect(service['buildInfo']).toBeDefined();
    });
  });

  describe('checkEduApiResponding', () => {
    it('should return health check result with build info', async () => {
      service.onModuleInit();
      const result = await service.checkEduApiResponding();

      expect(healthCheckService.check).toHaveBeenCalled();
      expect(result).toEqual(expect.objectContaining({ status: 'ok' }));
    });
  });

  describe('checkEduApiHealth', () => {
    it('should return health check with mongo and disk indicators', async () => {
      service.onModuleInit();
      const result = await service.checkEduApiHealth();

      expect(healthCheckService.check).toHaveBeenCalled();
      expect(result).toEqual(expect.objectContaining({ status: 'ok' }));
    });
  });

  describe('getEduApiStats', () => {
    it('should return full stats with all indicators', async () => {
      service.onModuleInit();
      const result = await service.getEduApiStats();

      expect(healthCheckService.check).toHaveBeenCalled();
      expect(result).toEqual(expect.objectContaining({ status: 'ok' }));
    });
  });

  describe('getThresholdPercent', () => {
    it('should return a number between 0 and 1 inclusive', () => {
      const result = HealthService['getThresholdPercent']();
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(1);
    });
  });
});
