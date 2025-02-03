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
