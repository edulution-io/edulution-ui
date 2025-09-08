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
import useGlobalSettingsApiStore from '@/pages/Settings/GlobalSettings/useGlobalSettingsApiStore';
import { useNavigate } from 'react-router-dom';
import CircleLoader from '@/components/ui/Loading/CircleLoader';

const DefaultLandingPageAfterLogin = () => {
  const { globalSettings } = useGlobalSettingsApiStore();
  const navigate = useNavigate();

  const defaultLandingPage = globalSettings?.general?.defaultLandingPage;
  const isCustomLandingPageEnabled = defaultLandingPage?.isCustomLandingPageEnabled;
  const appName = defaultLandingPage?.appName;

  useEffect(() => {
    if (isCustomLandingPageEnabled === undefined) return;

    if (isCustomLandingPageEnabled) {
      navigate(`/${appName}`, { replace: true });
    } else {
      navigate('/', { replace: true });
    }
  }, [isCustomLandingPageEnabled, appName, navigate]);

  if (isCustomLandingPageEnabled === undefined) {
    return <CircleLoader className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />;
  }

  return null;
};

export default DefaultLandingPageAfterLogin;
