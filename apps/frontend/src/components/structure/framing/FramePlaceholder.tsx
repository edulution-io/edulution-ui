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

import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import useFrameStore from '@/components/structure/framing/useFrameStore';
import useAppConfigsStore from '@/pages/Settings/AppConfig/useAppConfigsStore';
import useUserStore from '@/store/UserStore/useUserStore';
import { getFromPathName } from '@libs/common/utils';
import findAppConfigByName from '@libs/common/utils/findAppConfigByName';

const FramePlaceholder: React.FC = () => {
  const { pathname } = useLocation();
  const rootPathName = getFromPathName(pathname, 1);
  const { appConfigs } = useAppConfigsStore();
  const { isAuthenticated } = useUserStore();
  const { setEmbeddedFrameLoaded, setActiveEmbeddedFrame } = useFrameStore();

  useEffect(() => {
    if (isAuthenticated) {
      const appName = findAppConfigByName(appConfigs, rootPathName)?.name;
      if (appName) {
        setEmbeddedFrameLoaded(appName);
        setActiveEmbeddedFrame(appName);
      }
    }

    return () => {
      setActiveEmbeddedFrame(null);
    };
  }, [isAuthenticated, pathname]);

  return <div />;
};

export default FramePlaceholder;
