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

import type AppConfigDto from '@libs/appconfig/types/appConfigDto';
import { ExtendedOptionKeysType } from '@libs/appconfig/types/extendedOptionKeysType';
import VeyonProxyItem from '@libs/veyon/types/veyonProxyItem';

const getExtendedOptionsValue = (
  appConfigs: AppConfigDto[],
  settingLocation: string,
  key: ExtendedOptionKeysType,
): VeyonProxyItem[] | string => {
  const appConfig = appConfigs.find((config) => config.name === settingLocation);

  if (!appConfig || typeof appConfig.extendedOptions !== 'object') {
    return '';
  }

  return (appConfig.extendedOptions[key] as string) || '';
};

export default getExtendedOptionsValue;
