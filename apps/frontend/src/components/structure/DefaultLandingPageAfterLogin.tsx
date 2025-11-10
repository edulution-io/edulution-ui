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

import React, { useEffect } from 'react';
import useGlobalSettingsApiStore from '@/pages/Settings/GlobalSettings/useGlobalSettingsApiStore';
import { useNavigate } from 'react-router-dom';
import CircleLoader from '@/components/ui/Loading/CircleLoader';

const DefaultLandingPageAfterLogin = () => {
  const { globalSettings } = useGlobalSettingsApiStore();
  const navigate = useNavigate();
  const { isCustomLandingPageEnabled, appName } = globalSettings.general.defaultLandingPage;

  useEffect(() => {
    if (isCustomLandingPageEnabled === undefined) return;

    if (isCustomLandingPageEnabled) {
      navigate(`/${appName}`, { replace: true });
    } else {
      navigate('/', { replace: true });
    }
  }, [
    globalSettings.general.defaultLandingPage.isCustomLandingPageEnabled,
    globalSettings.general.defaultLandingPage.appName,
  ]);

  if (isCustomLandingPageEnabled === undefined) {
    return <CircleLoader className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />;
  }

  return null;
};

export default DefaultLandingPageAfterLogin;
