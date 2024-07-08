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
import { Connections } from '@libs/desktopdeployment/types';
import ConnectionErrorDialog from './components/ConnectionErrorDialog';
import useDesktopDeploymentStore from './DesktopDeploymentStore';
import VDIFrame from './VDIFrame';
import VdiCard from './components/VdiCard';

const iconContextValue = { className: 'h-8 w-8 m-5' };

const findVmByIp = (clones: { [vmId: string]: { ip: string; vmid: string } }, ip: string) =>
  Object.values(clones).filter((vm) => vm.ip === ip)[0]?.vmid || '';

const searchForName = (connections: Connections | null, vmid: string) => {
  if (connections) {
    const keys = Object.keys(connections);
    for (let i = 0; i < keys.length; i += 1) {
      if (connections[keys[i]].name === vmid) {
        return connections[keys[i]].identifier || '';
      }
    }
  }
  return '';
};
const DesktopDeploymentPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useUserStore();
  const {
    token,
    error,
    openVdiConnection,
    isLoading,
    connections,
    authenticate,
    setOpenVdiConnection,
    setGuacId,
    getConnections,
    postRequestVdi,
    getVirtualMachines,
  } = useDesktopDeploymentStore();
  const { activeFrame } = useFrameStore();

  const getStyle = () => (activeFrame === APPS.DESKTOP_DEPLOYMENT ? 'block' : 'hidden');

  const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false);
  const [cloneVms, setCloneVms] = useState({});

  useEffect(() => {
    void authenticate();

    const getClones = async () => {
      try {
        const response = await getVirtualMachines();
        const clones = response?.data?.['win10-vdi']?.clone_vms || {};
        setCloneVms(clones);
      } catch (e) {
        console.error(e);
      }
    };

    void getClones();
  }, [user]);

  useEffect(() => {
    if (token) {
      void getConnections();
    }
  }, [token]);

  useEffect(() => {
    if (Object.keys(cloneVms).length > 0) {
      const requestVdi = async () => {
        try {
          const response = await postRequestVdi();
          const vdiConnection = response?.data;
          if (vdiConnection) {
            const result = findVmByIp(cloneVms, vdiConnection.ip);
            const identifier = searchForName(connections, result);
            setGuacId(identifier);
          }
        } catch (e) {
          console.error(e);
        }
      };
      void requestVdi();
    }
  }, [cloneVms]);

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
        availableClients={Object.keys(cloneVms).length}
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
