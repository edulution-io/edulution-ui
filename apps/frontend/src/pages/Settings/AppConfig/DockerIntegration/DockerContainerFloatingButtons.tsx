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
import type TDockerCommands from '@libs/docker/types/TDockerCommands';
import useDockerApplicationStore from './useDockerApplicationStore';

const DockerContainerFloatingButtons: React.FC = () => {
  const { t } = useTranslation();
  const {
    tableContentData: containers,
    selectedRows,
    setSelectedRows,
    fetchContainers,
    runDockerCommand,
    deleteDockerContainer,
  } = useDockerApplicationStore();
  const selectedContainerId = Object.keys(selectedRows);
  const isButtonVisible = selectedContainerId.length > 0;
  const selectedContainer = containers.find((container) => container.Id === selectedContainerId[0]);
  const containerName = selectedContainer?.Names[0] || '';

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
        isVisible: isButtonVisible,
      },
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
