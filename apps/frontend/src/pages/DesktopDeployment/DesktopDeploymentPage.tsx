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
import VirtualMachineOs from '@libs/desktopdeployment/types/virtual-machines.enum';
import PageLayout from '@/components/structure/layout/PageLayout';
import useDesktopDeploymentStore from './useDesktopDeploymentStore';
import VdiCard from './components/VdiCard';
import DesktopDeploymentFloatingButtons from './components/DesktopDeploymentFloatingButtons';

const osConfigs = [
  { os: VirtualMachineOs.WIN11, title: 'desktopdeployment.win11' },
  { os: VirtualMachineOs.UBUNTU, title: 'desktopdeployment.ubuntu' },
];

const DesktopDeploymentPage: React.FC = () => {
  const { t } = useTranslation();
  const { isLoading, virtualMachines, createRdpSession, getVirtualMachines, postRequestVdi } =
    useDesktopDeploymentStore();

  useEffect(() => {
    void getVirtualMachines(false);
  }, []);

  const getAvailableCount = (osType: VirtualMachineOs): number => {
    if (!virtualMachines?.data?.[osType]?.summary) return 0;
    return virtualMachines.data[osType].summary.available_vms;
  };

  const handleConnect = (ip: string) => {
    void createRdpSession(ip);
  };

  const handleReload = () => {
    void getVirtualMachines(false);
  };

  const handleStart = async (osType: VirtualMachineOs) => {
    const ip = await postRequestVdi(osType);
    if (ip) {
      void createRdpSession(ip);
    }
  };

  return (
    <PageLayout
      nativeAppHeader={{
        title: t('desktopdeployment.topic'),
        description: t('desktopdeployment.description'),
        iconSrc: DesktopDeploymentIcon,
      }}
    >
      <div className="flex w-full flex-1 flex-wrap items-start gap-4">
        {osConfigs.map(({ os, title }) => (
          <VdiCard
            key={os}
            title={t(title)}
            availableCount={getAvailableCount(os)}
            osType={os}
            onSelect={() => handleStart(os)}
            onReload={handleReload}
          />
        ))}
      </div>
      <LoadingIndicatorDialog isOpen={isLoading} />
      <DesktopDeploymentFloatingButtons
        handleConnect={handleConnect}
        handleReload={handleReload}
      />
    </PageLayout>
  );
};

export default DesktopDeploymentPage;
