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

import { Test, TestingModule } from '@nestjs/testing';
import HealthController from './health.controller';
import HealthService from './health.service';

describe(HealthController.name, () => {
  let controller: HealthController;
  let healthService: Record<string, jest.Mock>;

  beforeEach(async () => {
    healthService = {
      checkEduApiResponding: jest.fn().mockResolvedValue({ status: 'ok' }),
      checkEduApiHealth: jest.fn().mockResolvedValue({ status: 'ok' }),
      getEduApiStats: jest.fn().mockResolvedValue({ status: 'ok' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [{ provide: HealthService, useValue: healthService }],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('check', () => {
    it('should delegate to healthService.checkEduApiResponding', async () => {
      const result = await controller.check();
      expect(healthService.checkEduApiResponding).toHaveBeenCalled();
      expect(result).toEqual({ status: 'ok' });
    });
  });

  describe('readiness', () => {
    it('should delegate to healthService.checkEduApiHealth', async () => {
      const result = await controller.readiness();
      expect(healthService.checkEduApiHealth).toHaveBeenCalled();
      expect(result).toEqual({ status: 'ok' });
    });
  });

  describe('getStats', () => {
    it('should delegate to healthService.getEduApiStats', async () => {
      const result = await controller.getStats();
      expect(healthService.getEduApiStats).toHaveBeenCalled();
      expect(result).toEqual({ status: 'ok' });
    });
  });
});
