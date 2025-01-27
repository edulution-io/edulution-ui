import React from 'react';
import { AiOutlineStop } from 'react-icons/ai';
import { MdOutlineRestartAlt } from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import FloatingButtonsBarConfig from '@libs/ui/types/FloatingButtons/floatingButtonsBarConfig';
import DeleteButton from '@/components/shared/FloatingsButtonsBar/CommonButtonConfigs/deleteButton';
import ReloadButton from '@/components/shared/FloatingsButtonsBar/CommonButtonConfigs/reloadButton';
import FloatingButtonsBar from '@/components/shared/FloatingsButtonsBar/FloatingButtonsBar';
import StartButton from '@/components/shared/FloatingsButtonsBar/CommonButtonConfigs/startButton';
import StopButton from '@/components/shared/FloatingsButtonsBar/CommonButtonConfigs/stopButton';
import DOCKER_COMMANDS from '@libs/docker/constants/dockerCommands';
import DOCKER_PROTECTED_CONTAINER from '@libs/docker/constants/dockerProtectedContainer';
import DOCKER_STATES from '@libs/docker/constants/dockerStates';
import type TDockerCommands from '@libs/docker/types/TDockerCommands';
import type TDockerProtectedContainer from '@libs/docker/types/TDockerProtectedContainer';
import useDockerApplicationStore from './useDockerApplicationStore';

const DockerContainerFloatingButtons: React.FC = () => {
  const { t } = useTranslation();
  const { containers, selectedRows, setSelectedRows, fetchContainers, runDockerCommand, deleteDockerContainer } =
    useDockerApplicationStore();
  const selectedContainerId = Object.keys(selectedRows);
  const selectedContainer = containers.filter((container) => selectedContainerId.includes(container.Id));
  const containerNames = selectedContainer.map((container) => container.Names[0]) || [''];

  const areSelectedContainerRunning = selectedContainer.some((container) => container.State === DOCKER_STATES.RUNNING);
  const areSelectedContainerNotRunning = selectedContainer.every(
    (container) => container.State === DOCKER_STATES.RUNNING,
  );
  const areSelectedContainersProtected = selectedContainer.some((container) =>
    Object.values(DOCKER_PROTECTED_CONTAINER).includes(container.Names?.[0].split('/')[1] as TDockerProtectedContainer),
  );
  const isButtonVisible = selectedContainerId.length > 0 && !areSelectedContainersProtected;

  const handleActionClick = (action: TDockerCommands) => {
    void runDockerCommand(containerNames, action);
  };

  const handleDeleteClick = () => {
    void deleteDockerContainer(containerNames);
    setSelectedRows({});
  };

  const config: FloatingButtonsBarConfig = {
    buttons: [
      StartButton(() => handleActionClick(DOCKER_COMMANDS.START), isButtonVisible && !areSelectedContainerRunning),
      StopButton(() => handleActionClick(DOCKER_COMMANDS.STOP), isButtonVisible && areSelectedContainerNotRunning),
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
        isVisible: isButtonVisible && areSelectedContainerNotRunning,
      },
      DeleteButton(() => handleDeleteClick(), isButtonVisible && !areSelectedContainerRunning),
      ReloadButton(() => {
        void fetchContainers();
      }),
    ],
    keyPrefix: 'docker-table-floating-button_',
  };

  return <FloatingButtonsBar config={config} />;
};

export default DockerContainerFloatingButtons;
