import React, { useEffect } from 'react';
import NativeAppHeader from '@/components/layout/NativeAppHeader';
import { DesktopDeploymentIcon } from '@/assets/icons';
import { useTranslation } from 'react-i18next';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import cn from '@/lib/utils';
import useUserStore from '@/store/UserStore/UserStore';
import VirtualMachineOs from '@libs/desktopdeployment/types/virtual-machines.enum';
import { VirtualMachines } from '@libs/desktopdeployment/types';
import { VDI_SYNC_TIME_INTERVAL } from '@libs/desktopdeployment/constants';
import { useInterval } from 'usehooks-ts';
import useIsMobileView from '@/hooks/useIsMobileView';
import ConnectionErrorDialog from './components/ConnectionErrorDialog';
import useDesktopDeploymentStore from './DesktopDeploymentStore';
import VDIFrame from './VDIFrame';
import VdiCard from './components/VdiCard';
import FloatingButtonsBar from './components/FloatingButtonsBar';

const osConfigs = [
  { os: VirtualMachineOs.WIN10, title: 'desktopdeployment.win10' },
  { os: VirtualMachineOs.WIN11, title: 'desktopdeployment.win11' },
  { os: VirtualMachineOs.UBUNTU, title: 'desktopdeployment.ubuntu' },
];

const DesktopDeploymentPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useUserStore();
  const {
    guacToken,
    connectionEnabled,
    vdiIp,
    openVdiConnection,
    isLoading,
    virtualMachines,
    authenticate,
    setOpenVdiConnection,
    postRequestVdi,
    createOrUpdateConnection,
    getConnection,
    getVirtualMachines,
  } = useDesktopDeploymentStore();
  const isMobileView = useIsMobileView();

  useEffect(() => {
    if (!guacToken) {
      void authenticate();
    }
  }, [guacToken]);

  useEffect(() => {
    if (user) {
      void postRequestVdi(VirtualMachineOs.WIN10);
    }
  }, [user]);

  useEffect(() => {
    if (vdiIp) {
      void createOrUpdateConnection();
    }
  }, [vdiIp]);

  useEffect(() => {
    if (connectionEnabled) {
      void getConnection();
    }
  }, [connectionEnabled]);

  useEffect(() => {
    void getVirtualMachines(false);
  }, []);

  useInterval(() => {
    void getVirtualMachines(true);
  }, VDI_SYNC_TIME_INTERVAL);

  const getAvailableClients = (osType: VirtualMachineOs, vms: VirtualMachines | null): number => {
    if (vms && vms.data[osType]) {
      const cloneVms = vms.data[osType].clone_vms;
      return Object.values(cloneVms).filter((vm) => vm.status === 'running').length;
    }
    return 0;
  };

  const handleConnect = () => {
    setOpenVdiConnection(true);
  };

  const handleReload = () => {
    void authenticate();
    void postRequestVdi(VirtualMachineOs.WIN10);
  };

  return (
    <div className="absolute inset-y-0 left-0 ml-0 mr-14 w-screen p-5 lg:pr-20">
      <NativeAppHeader
        title={t('desktopdeployment.topic')}
        description={t('desktopdeployment.description')}
        iconSrc={DesktopDeploymentIcon}
      />
      {openVdiConnection && <VDIFrame />}
      <div className={cn('flex gap-10', isMobileView ? 'flex-col' : 'flex-row')}>
        {osConfigs.map(({ os, title }) => (
          <VdiCard
            key={os}
            title={t(title)}
            availableClients={getAvailableClients(os, virtualMachines)}
            onClick={() => handleConnect()}
            osType={os}
            disabled={getAvailableClients(os, virtualMachines) === 0}
          />
        ))}
      </div>
      <FloatingButtonsBar
        handleConnect={handleConnect}
        handleReload={handleReload}
      />
      <ConnectionErrorDialog handleReload={handleReload} />
      <LoadingIndicator isOpen={isLoading} />
    </div>
  );
};

export default DesktopDeploymentPage;
