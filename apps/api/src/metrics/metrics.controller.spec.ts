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
import MetricsController from './metrics.controller';
import MetricsService from './metrics.service';
import GlobalSettingsService from '../global-settings/global-settings.service';

describe(MetricsController.name, () => {
  let controller: MetricsController;
  let metricsService: Record<string, jest.Mock>;

  beforeEach(async () => {
    metricsService = {
      getMetrics: jest.fn().mockResolvedValue({
        version: '1.0.0',
        uptime: '100.00',
        cpuUserMs: 50,
        cpuSystemMs: 10,
        memory: { rssMB: 100, heapUsedMB: 50, heapTotalMB: 80 },
        dockerStats: [],
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MetricsController],
      providers: [
        { provide: MetricsService, useValue: metricsService },
        { provide: GlobalSettingsService, useValue: { getAdminGroupsFromCache: jest.fn().mockResolvedValue([]) } },
      ],
    }).compile();

    controller = module.get<MetricsController>(MetricsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getMetrics', () => {
    it('should delegate to metricsService.getMetrics', async () => {
      const result = await controller.getMetrics();

      expect(metricsService.getMetrics).toHaveBeenCalled();
      expect(result).toEqual(
        expect.objectContaining({
          version: '1.0.0',
          uptime: '100.00',
        }),
      );
    });
  });
});
