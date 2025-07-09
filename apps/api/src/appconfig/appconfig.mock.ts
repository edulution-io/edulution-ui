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
