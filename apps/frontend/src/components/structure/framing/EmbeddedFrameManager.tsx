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

import React from 'react';
import useFrameStore from '@/components/structure/framing/useFrameStore';
import useAppConfigsStore from '@/pages/Settings/AppConfig/useAppConfigsStore';
import APP_INTEGRATION_VARIANT from '@libs/appconfig/constants/appIntegrationVariants';
import useUserAccounts from '@/hooks/useUserAccounts';

const EmbeddedFrameManager = () => {
  const { appConfigs } = useAppConfigsStore();
  const { loadedEmbeddedFrames, activeEmbeddedFrame } = useFrameStore();

  useUserAccounts(activeEmbeddedFrame);

  return appConfigs
    .filter((appConfig) => appConfig.appType === APP_INTEGRATION_VARIANT.FRAMED)
    .map((appConfig) => {
      const isOpen = activeEmbeddedFrame === appConfig.name;
      const url = loadedEmbeddedFrames.includes(appConfig.name) ? appConfig.options.url : undefined;

      return (
        <iframe
          key={appConfig.name}
          title={appConfig.name}
          className={`absolute inset-y-0 left-0 ml-0 w-full ${isOpen ? 'block' : 'hidden'}`}
          height="100%"
          src={url}
        />
      );
    });
};

export default EmbeddedFrameManager;
