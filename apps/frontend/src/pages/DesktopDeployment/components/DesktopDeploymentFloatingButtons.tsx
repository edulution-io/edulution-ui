import React from 'react';
import FloatingButtonsBarConfig from '@libs/common/types/floatingButtonsBarConfig';
import ConnectButton from '@/components/shared/FloatingButtons/ConnectButton';
import ReloadButton from '@/components/shared/FloatingButtons/ReloadButton';
import FloatingButtonsBar from '@/components/shared/FloatingButtonsBar';

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
