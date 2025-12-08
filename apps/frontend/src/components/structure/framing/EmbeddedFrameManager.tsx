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

import React from 'react';
import useFrameStore from '@/components/structure/framing/useFrameStore';
import useAppConfigsStore from '@/pages/Settings/AppConfig/useAppConfigsStore';
import APP_INTEGRATION_VARIANT from '@libs/appconfig/constants/appIntegrationVariant';
import useUserAccounts from '@/hooks/useUserAccounts';
import IFRAME_ALLOWED_CONFIG from '@libs/ui/constants/iframeAllowedConfig';

const EmbeddedFrameManager = () => {
  const { appConfigs } = useAppConfigsStore();
  const { loadedEmbeddedFrames, activeEmbeddedFrame } = useFrameStore();

  useUserAccounts(activeEmbeddedFrame);

  return appConfigs
    .filter((appConfig) => appConfig.appType === APP_INTEGRATION_VARIANT.FRAME)
    .map((appConfig) => {
      const isOpen = activeEmbeddedFrame === appConfig.name;
      const url = loadedEmbeddedFrames.includes(appConfig.name) ? appConfig.options.url : undefined;

      return (
        <iframe
          key={appConfig.name}
          title={appConfig.name}
          className={`absolute inset-y-0 left-0 ml-0 w-full ${isOpen ? 'block' : 'hidden'}`}
          allow={IFRAME_ALLOWED_CONFIG}
          height="100%"
          src={url}
        />
      );
    });
};

export default EmbeddedFrameManager;
