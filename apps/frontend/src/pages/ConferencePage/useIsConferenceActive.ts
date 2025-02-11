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

import { useMemo } from 'react';
import type AppConfigDto from '@libs/appconfig/types/appConfigDto';
import useAppConfigsStore from '@/pages/Settings/AppConfig/appConfigsStore';
import APPS from '@libs/appconfig/constants/apps';

// TODO: NIEDUUI-312: Remove this check when the information about the app is stored in the appConfigs/userConfig/dataBase
const useIsConferenceActive = () => {
  const { appConfigs } = useAppConfigsStore();

  return useMemo(
    () => !!appConfigs.find((conf: AppConfigDto) => conf.name === APPS.CONFERENCES.toString()),
    [appConfigs],
  );
};

export default useIsConferenceActive;
