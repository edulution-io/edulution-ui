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

import APP_INTEGRATION_VARIANT from '@libs/appconfig/constants/appIntegrationVariants';
import ExtendedOptionKeys from '@libs/appconfig/constants/extendedOptionKeys';
import type AppConfigDto from '@libs/appconfig/types/appConfigDto';

export const mockAppConfigService = {
  insertConfig: jest.fn().mockResolvedValue(undefined),
  updateConfig: jest.fn().mockResolvedValue(undefined),
  getAppConfigs: jest.fn().mockResolvedValue([]),
  deleteConfig: jest.fn().mockResolvedValue(undefined),
  getFileAsBase64: jest.fn(),
  getAppConfigByName: jest.fn().mockResolvedValue({
    options: {
      url: 'https://example.com/api/',
      apiKey: 'secret-key',
    },
    extendedOptions: {
      [ExtendedOptionKeys.ONLY_OFFICE_URL]: 'https://example.com/api/',
      [ExtendedOptionKeys.ONLY_OFFICE_JWT_SECRET]: 'secret-key',
    },
  }),
};

export const mockLdapGroup = ['/role-globaladministrator'];

export const mockAppConfig: AppConfigDto = {
  name: 'filesharing',
  icon: 'icon-path',
  appType: APP_INTEGRATION_VARIANT.NATIVE,
  options: {
    url: 'test/path',
    apiKey: '123456789',
  },
  accessGroups: [
    { id: '1', value: 'group1', name: 'group1', path: 'group1', label: 'group1' },
    { id: '2', value: 'group2', name: 'group2', path: 'group2', label: 'group2' },
  ],
  extendedOptions: {
    [ExtendedOptionKeys.ONLY_OFFICE_URL]: 'https://example.com/2/',
    [ExtendedOptionKeys.ONLY_OFFICE_JWT_SECRET]: 'secret-key',
  },
  position: 1,
};

const makeMockQuery = <T>(result: T) => ({
  sort: jest.fn().mockReturnThis(),
  lean: jest.fn().mockResolvedValue(result),
});

export const mockAppConfigModel = {
  create: jest.fn(),
  bulkWrite: jest.fn().mockResolvedValue({}),
  find: jest.fn().mockImplementation(() => makeMockQuery([mockAppConfig])),
  findOne: jest.fn().mockImplementation(() => makeMockQuery({ ...mockAppConfig })),
  updateOne: jest.fn(),
  deleteOne: jest.fn(),
};
