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

import React from 'react';
import { AiOutlineStop } from 'react-icons/ai';
import { MdOutlineRestartAlt, MdOutlineUpdate } from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import FloatingButtonsBarConfig from '@libs/ui/types/FloatingButtons/floatingButtonsBarConfig';
import DeleteButton from '@/components/shared/FloatingsButtonsBar/CommonButtonConfigs/deleteButton';
import ReloadButton from '@/components/shared/FloatingsButtonsBar/CommonButtonConfigs/reloadButton';
import FloatingButtonsBar from '@/components/shared/FloatingsButtonsBar/FloatingButtonsBar';
import StartButton from '@/components/shared/FloatingsButtonsBar/CommonButtonConfigs/startButton';
import StopButton from '@/components/shared/FloatingsButtonsBar/CommonButtonConfigs/stopButton';
import DOCKER_COMMANDS from '@libs/docker/constants/dockerCommands';
import DOCKER_PROTECTED_CONTAINERS from '@libs/docker/constants/dockerProtectedContainer';
import DOCKER_STATES from '@libs/docker/constants/dockerStates';
import type TDockerCommands from '@libs/docker/types/TDockerCommands';
import type TDockerProtectedContainer from '@libs/docker/types/TDockerProtectedContainer';
import useDockerApplicationStore from './useDockerApplicationStore';

const DockerContainerFloatingButtons: React.FC = () => {
  const { t } = useTranslation();
  const {
    containers,
    selectedRows,
    setSelectedRows,
    getContainers,
    runDockerCommand,
    deleteDockerContainer,
    updateContainer,
  } = useDockerApplicationStore();
  const selectedContainerId = Object.keys(selectedRows);
  const selectedContainers = containers.filter((container) => selectedContainerId.includes(container.Id));
  const containerNames = selectedContainers.map((container) => container.Names?.[0].split('/')[1]) || [''];

  const areSelectedContainersRunning = selectedContainers.some(
    (container) => container.State === DOCKER_STATES.RUNNING,
  );
  const areSelectedContainersNotRunning = selectedContainers.every(
    (container) => container.State === DOCKER_STATES.RUNNING || container.State === DOCKER_STATES.RESTARTING,
  );
  const areSelectedContainersProtected = selectedContainers.some((container) =>
    Object.values(DOCKER_PROTECTED_CONTAINERS).includes(
      container.Names?.[0].split('/')[1] as TDockerProtectedContainer,
    ),
  );
  const isButtonVisible = selectedContainerId.length > 0 && !areSelectedContainersProtected;

  const handleActionClick = (action: TDockerCommands) => {
    void runDockerCommand(containerNames, action);
  };

  const handleUpdateClick = () => {
    void updateContainer(containerNames);
    setSelectedRows({});
  };

  const handleDeleteClick = () => {
    void deleteDockerContainer(containerNames);
    setSelectedRows({});
  };

  const config: FloatingButtonsBarConfig = {
    buttons: [
      StartButton(() => handleActionClick(DOCKER_COMMANDS.START), isButtonVisible && !areSelectedContainersRunning),
      StopButton(() => handleActionClick(DOCKER_COMMANDS.STOP), isButtonVisible && areSelectedContainersNotRunning),
      {
        icon: MdOutlineRestartAlt,
        text: t(`common.${DOCKER_COMMANDS.RESTART}`),
        onClick: () => handleActionClick(DOCKER_COMMANDS.RESTART),
        isVisible: isButtonVisible,
      },
      {
        icon: AiOutlineStop,
        text: t(`common.${DOCKER_COMMANDS.KILL}`),
        onClick: () => handleActionClick(DOCKER_COMMANDS.KILL),
        isVisible: isButtonVisible && areSelectedContainersNotRunning,
      },
      DeleteButton(() => handleDeleteClick(), isButtonVisible && !areSelectedContainersRunning),
      ReloadButton(() => {
        void getContainers();
      }),
      {
        icon: MdOutlineUpdate,
        text: t(`common.update`),
        onClick: () => handleUpdateClick(),
        isVisible: isButtonVisible,
      },
    ],
    keyPrefix: 'docker-table-floating-button_',
  };

  return <FloatingButtonsBar config={config} />;
};

export default DockerContainerFloatingButtons;
