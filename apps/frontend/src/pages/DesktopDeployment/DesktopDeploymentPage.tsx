import React, { useEffect, useState } from 'react';
import { Button } from '@/components/shared/Button';
import { useTranslation } from 'react-i18next';
import { TooltipProvider } from '@/components/ui/Tooltip';
import { RiShareForward2Line } from 'react-icons/ri';
import { IconContext } from 'react-icons';
import ConnectionErrorDialog from './components/ConnectionErrorDialog';
import useDesktopDeploymentStore from './DesktopDeploymentStore';
import VDIFrame from './VDIFrame';
import NativeAppHeader from '@/components/layout/NativeAppHeader';
import { DesktopDeploymentIcon } from '@/assets/icons';
import useFrameStore from '@/routes/IframeStore';
import { APPS } from '@/datatypes/types';
import cn from '@/lib/utils';

const iconContextValue = { className: 'h-8 w-8 m-5' };

const DesktopDeploymentPage: React.FC = () => {
  const { t } = useTranslation();
  const { token, error, authenticate } = useDesktopDeploymentStore();
  const { activeFrame } = useFrameStore();

  const getStyle = () => (activeFrame === APPS.DESKTOP_DEPLOYMENT ? 'block' : 'hidden');

  const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false);

  // useEffect(() => {
  //   // eslint-disable-next-line no-void
  //   void authenticate();
  // }, [user]);

  // useEffect(() => {
  //   if (token) {
  //     getConnections().catch((e) => console.error(e));
  //   }
  // }, [token]);

  // const getFirstConnection = (conns) => {
  //   const keys = Object.keys(conns);
  //   if (keys.length === 0) return undefined;
  //   const firstKey = keys[0];
  //   return conns[firstKey];
  // };

  // const firstConnection = connections && getFirstConnection(connections);

  // if (firstConnection) {
  //   console.log('First connection:', firstConnection);
  // } else {
  //   console.log('No connections found.');
  // }
  useEffect(() => {
    if (error) {
      setIsErrorDialogOpen(true);
    }
  }, [error]);

  return (
    <div className={cn('absolute inset-y-0 left-0 ml-0 mr-14 w-screen p-5 lg:pr-20', getStyle())}>
      <NativeAppHeader
        title={t('desktopdeployment.topic')}
        description={t('desktopdeployment.description')}
        iconSrc={DesktopDeploymentIcon}
      />

      {token && <VDIFrame />}
      {error && (
        <ConnectionErrorDialog
          isErrorDialogOpen={isErrorDialogOpen}
          setIsErrorDialogOpen={setIsErrorDialogOpen}
          handleReload={authenticate}
        />
      )}
      <div className="fixed bottom-10 left-10 flex flex-row space-x-8">
        <TooltipProvider>
          <div className="flex flex-col items-center">
            <Button
              type="button"
              variant="btn-hexagon"
              className="bg-opacity-90 p-4"
              onClickCapture={authenticate}
            >
              <IconContext.Provider value={iconContextValue}>
                <RiShareForward2Line />
              </IconContext.Provider>
            </Button>
            <p className="mt-2 text-white">{t('desktopdeployment.connect')}</p>
          </div>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default DesktopDeploymentPage;
