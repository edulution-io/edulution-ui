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

import React, { useEffect } from 'react';
import { DesktopDeploymentIcon } from '@/assets/icons';
import { useTranslation } from 'react-i18next';
import LoadingIndicatorDialog from '@/components/ui/Loading/LoadingIndicatorDialog';
import useUserStore from '@/store/UserStore/useUserStore';
import VirtualMachineOs from '@libs/desktopdeployment/types/virtual-machines.enum';
import { VirtualMachines } from '@libs/desktopdeployment/types';
import { VDI_SYNC_TIME_INTERVAL } from '@libs/desktopdeployment/constants';
import { useInterval } from 'usehooks-ts';
import PageLayout from '@/components/structure/layout/PageLayout';
import DOCKER_STATES from '@libs/docker/constants/dockerStates';
import ConnectionErrorDialog from './components/ConnectionErrorDialog';
import useDesktopDeploymentStore from './useDesktopDeploymentStore';
import VdiCard from './components/VdiCard';
import DesktopDeploymentFloatingButtons from './components/DesktopDeploymentFloatingButtons';

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
    isLoading,
    virtualMachines,
    authenticate,
    setIsVdiConnectionOpen,
    postRequestVdi,
    createOrUpdateConnection,
    getConnection,
    getVirtualMachines,
  } = useDesktopDeploymentStore();

  useEffect(() => {
    if (!guacToken) {
      void authenticate();
    }
  }, [guacToken]);

  useEffect(() => {
    if (user) {
      void postRequestVdi(VirtualMachineOs.WIN11);
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
      return Object.values(cloneVms).filter((vm) => vm.status === DOCKER_STATES.RUNNING).length;
    }
    return 0;
  };

  const handleConnect = () => {
    setIsVdiConnectionOpen(true);
  };

  const handleReload = () => {
    void authenticate();
    void postRequestVdi(VirtualMachineOs.WIN11);
  };

  return (
    <PageLayout
      nativeAppHeader={{
        title: t('desktopdeployment.topic'),
        description: t('desktopdeployment.description'),
        iconSrc: DesktopDeploymentIcon,
      }}
    >
      <div className="flex w-full flex-1 flex-col items-start gap-10 md:ml-0 md:flex-row">
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
      <ConnectionErrorDialog handleReload={handleReload} />
      <LoadingIndicatorDialog isOpen={isLoading} />
      <DesktopDeploymentFloatingButtons
        handleConnect={handleConnect}
        handleReload={handleReload}
      />
    </PageLayout>
  );
};

export default DesktopDeploymentPage;
