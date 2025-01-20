import React from 'react';
import FloatingButtonsBarConfig from '@libs/ui/types/FloatingButtons/floatingButtonsBarConfig';
import DeleteButton from '@/components/shared/FloatingsButtonsBar/CommonButtonConfigs/deleteButton';
import ReloadButton from '@/components/shared/FloatingsButtonsBar/CommonButtonConfigs/reloadButton';
import FloatingButtonsBar from '@/components/shared/FloatingsButtonsBar/FloatingButtonsBar';
import StartButton from '@/components/shared/FloatingsButtonsBar/CommonButtonConfigs/startButton';
import StopButton from '@/components/shared/FloatingsButtonsBar/CommonButtonConfigs/stopButton';
import DOCKER_COMMANDS from '@libs/docker/constants/dockerCommands';
import type TDockerCommands from '@libs/docker/types/TDockerCommands';
import useDockerApplicationStore from './useDockerApplicationStore';

const DockerContainerFloatingButtons: React.FC = () => {
  const { containers, selectedRows, setSelectedRows, fetchContainers, runDockerCommand, deleteDockerContainer } =
    useDockerApplicationStore();
  const selectedContainerId = Object.keys(selectedRows);
  const isButtonVisible = selectedContainerId.length > 0;
  const containerName = containers.find((container) => container.Id === selectedContainerId[0])?.Names[0] || '';

  const handleActionClick = (action: TDockerCommands) => {
    void runDockerCommand(containerName, action);
  };

  const handleDeleteClick = () => {
    void deleteDockerContainer(containerName);
    setSelectedRows({});
  };

  const config: FloatingButtonsBarConfig = {
    buttons: [
      StartButton(() => handleActionClick(DOCKER_COMMANDS.START), isButtonVisible),
      StopButton(() => handleActionClick(DOCKER_COMMANDS.STOP), isButtonVisible),
      StartButton(() => handleActionClick(DOCKER_COMMANDS.RESTART), isButtonVisible),
      DeleteButton(() => handleDeleteClick(), isButtonVisible),
      ReloadButton(() => {
        void fetchContainers();
      }),
    ],
    keyPrefix: 'docker-table-floating-button_',
  };

  return <FloatingButtonsBar config={config} />;
};

export default DockerContainerFloatingButtons;
