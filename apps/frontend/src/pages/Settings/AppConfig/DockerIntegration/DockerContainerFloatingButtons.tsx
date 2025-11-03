/*
 * LICENSE
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
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
