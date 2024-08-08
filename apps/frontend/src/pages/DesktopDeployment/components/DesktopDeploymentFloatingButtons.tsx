import React from 'react';
import FloatingButtonsBarConfig from '@libs/common/types/floatingButtonsBarConfig';
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
