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

  useEffect(() => {
    /* To get a "token" from guacamole */
    void authenticate();
    /* To get a "connection" from lmn vdi */
    void postRequestVdi(VirtualMachineOs.WIN10);
  }, [user]);

  useEffect(() => {
    if (vdiIp) {
      void createOrUpdateConnection();
    }
  }, [vdiIp]);

  useEffect(() => {
    if (connectionEnabled) {
      void getConnections();
    }
  }, [connectionEnabled]);

  useEffect(() => {
    if (error) {
      setIsErrorDialogOpen(true);
    }
  }, [error]);

  const handleConnnect = () => {
    setOpenVdiConnection(true);
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
          handleReload={() => authenticate()}
        />
      )}
      <VdiCard
        title={t('desktopdeployment.win10')}
        availableClients={1}
        onClick={() => handleConnnect()}
      />
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
            <p className="mt-2 text-white">{t('desktopdeployment.connect')}</p>
          </div>
        </TooltipProvider>
      </div>
      <LoadingIndicator isOpen={isLoading} />
    </div>
  );
};

export default DesktopDeploymentPage;
