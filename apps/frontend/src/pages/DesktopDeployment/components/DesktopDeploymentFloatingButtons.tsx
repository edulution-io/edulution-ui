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
import FloatingButtonsBarConfig from '@libs/ui/types/FloatingButtons/floatingButtonsBarConfig';
import ConnectButton from '@/components/shared/FloatingsButtonsBar/CommonButtonConfigs/connectButton';
import ReloadButton from '@/components/shared/FloatingsButtonsBar/CommonButtonConfigs/reloadButton';
import FloatingButtonsBar from '@/components/shared/FloatingsButtonsBar/FloatingButtonsBar';

type FloatingButtonsProps = {
  handleConnect: () => void;
  handleReload: () => void;
};

const DesktopDeploymentFloatingButtons: React.FC<FloatingButtonsProps> = ({ handleConnect, handleReload }) => {
  const config: FloatingButtonsBarConfig = {
    buttons: [ConnectButton(handleConnect), ReloadButton(handleReload)],
    keyPrefix: 'desktop-deployment-page-floating-button_',
  };

  return <FloatingButtonsBar config={config} />;
};

export default DesktopDeploymentFloatingButtons;
