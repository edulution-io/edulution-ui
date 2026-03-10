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

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, import/no-extraneous-dependencies */
import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import cacheManagerMock from './cacheManagerMock';

interface PresetOptions {
  providers: any[];
  imports?: any[];
  skipCacheManager?: boolean;
}

const createTestingModule = async (options: PresetOptions): Promise<TestingModule> => {
  Logger.error = jest.fn();
  Logger.warn = jest.fn();
  Logger.log = jest.fn();

  const providers = [...options.providers];
  if (!options.skipCacheManager) {
    providers.push({ provide: CACHE_MANAGER, useValue: cacheManagerMock });
  }

  return Test.createTestingModule({
    imports: options.imports ?? [],
    providers,
  }).compile();
};

export default createTestingModule;
