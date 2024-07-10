import React, { useEffect, useState } from 'react';
import { Button } from '@/components/shared/Button';
import { TooltipProvider } from '@/components/ui/Tooltip';
import { RiShareForward2Line } from 'react-icons/ri';
import NativeAppHeader from '@/components/layout/NativeAppHeader';
import { DesktopDeploymentIcon } from '@/assets/icons';
import { useTranslation } from 'react-i18next';
import { IconContext } from 'react-icons';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import useFrameStore from '@/components/framing/FrameStore';
import { APPS } from '@libs/appconfig/types';
import cn from '@/lib/utils';
import useUserStore from '@/store/UserStore/UserStore';
import VirtualMachineOs from '@libs/desktopdeployment/types/virtual-machines.enum';
import ConnectionErrorDialog from './components/ConnectionErrorDialog';
import useDesktopDeploymentStore from './DesktopDeploymentStore';
import VDIFrame from './VDIFrame';
import VdiCard from './components/VdiCard';

const iconContextValue = { className: 'h-8 w-8 m-5' };

const DesktopDeploymentPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useUserStore();
  const {
    guacId,
    connectionEnabled,
    vdiIp,
    error,
    openVdiConnection,
    isLoading,
    authenticate,
    setOpenVdiConnection,
    postRequestVdi,
    createOrUpdateConnection,
    getConnections,
  } = useDesktopDeploymentStore();
  const { activeFrame } = useFrameStore();

  const getStyle = () => (activeFrame === APPS.DESKTOP_DEPLOYMENT ? 'block' : 'hidden');

  const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false);

  const initialize = async () => {
    if (user) {
      await authenticate();
      await postRequestVdi(VirtualMachineOs.WIN10);
    }
    if (vdiIp) {
      await createOrUpdateConnection();
    }
    if (connectionEnabled) {
      await getConnections();
    }
  };

  useEffect(() => {
    void initialize();
  }, [user, vdiIp, connectionEnabled]);

  useEffect(() => {
    if (error) {
      setIsErrorDialogOpen(true);
    }
  }, [error]);

  const handleConnnect = () => {
    setOpenVdiConnection(true);
  };

  const handleReload = () => {
    void initialize();
  };

  return (
    <div className={cn('absolute inset-y-0 left-0 ml-0 mr-14 w-screen p-5 lg:pr-20', getStyle())}>
      <NativeAppHeader
        title={t('desktopdeployment.topic')}
        description={t('desktopdeployment.description')}
        iconSrc={DesktopDeploymentIcon}
      />

      {openVdiConnection && <VDIFrame />}
      {error && (
        <ConnectionErrorDialog
          isErrorDialogOpen={isErrorDialogOpen}
          setIsErrorDialogOpen={setIsErrorDialogOpen}
          handleReload={() => getConnections()}
        />
      )}
      <div className="flex flex-row gap-10">
        <VdiCard
          title={t('desktopdeployment.win10')}
          availableClients={guacId ? 1 : 0}
          onClick={() => handleConnnect()}
          osType={VirtualMachineOs.WIN10}
        />
        <VdiCard
          /* Not implemented */
          title={t('desktopdeployment.win11')}
          availableClients={0}
          onClick={() => handleConnnect()}
          osType={VirtualMachineOs.WIN11}
          disabled
        />
        <VdiCard
          /* Not implemented */
          title={t('desktopdeployment.ubuntu')}
          availableClients={0}
          onClick={() => handleConnnect()}
          osType={VirtualMachineOs.UBUNTU}
          disabled
        />
      </div>
      <div className="fixed bottom-10 left-10 flex flex-row space-x-8">
        <TooltipProvider>
          <div className="flex flex-col items-center">
            <Button
              type="button"
              variant="btn-hexagon"
              className="bg-opacity-90 p-4"
              onClickCapture={() => handleConnnect()}
            >
              <IconContext.Provider value={iconContextValue}>
                <RiShareForward2Line />
              </IconContext.Provider>
            </Button>
            <p className="mt-2 text-background">{t('desktopdeployment.connect')}</p>
          </div>
        </TooltipProvider>
        <TooltipProvider>
          <div className="flex flex-col items-center">
            <Button
              type="button"
              variant="btn-hexagon"
              className="bg-opacity-90 p-4"
              onClickCapture={() => handleReload()}
            >
              <IconContext.Provider value={iconContextValue}>
                <RiShareForward2Line />
              </IconContext.Provider>
            </Button>
            <p className="mt-2 text-background">{t('desktopdeployment.reload')}</p>
          </div>
        </TooltipProvider>
      </div>
      <LoadingIndicator isOpen={isLoading} />
    </div>
  );
};

export default DesktopDeploymentPage;
