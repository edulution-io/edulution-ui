import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/shared/Button';
import ProgressTextArea from '@/components/shared/ProgressTextArea';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import DOCKER_APPLICATIONS from '@libs/docker/constants/dockerApplicationList';
import SSE_MESSAGE_TYPE from '@libs/common/constants/sseMessageType';
import type DockerEvent from '@libs/docker/types/dockerEvents';
import type TApps from '@libs/appconfig/types/appsType';
import type DockerCompose from '@libs/docker/types/dockerCompose';
import convertComposeToDockerode from '@libs/docker/utils/convertComposeToDockerode';
import useDockerApplicationStore from './useDockerApplicationStore';
import useAppConfigTableDialogStore from '../components/table/useAppConfigTableDialogStore';

interface CreateDockerContainerDialogProps {
  settingLocation: TApps;
}

const CreateDockerContainerDialog: React.FC<CreateDockerContainerDialogProps> = ({ settingLocation }) => {
  const { t } = useTranslation();
  const [dockerProgress, setDockerProgress] = useState(['']);
  const [dockerConfig, setDockerConfig] = useState<DockerCompose>({ services: {} });
  const {
    eventSource,
    tableContentData: containers,
    createAndRunContainer,
    getDockerContainerConfig,
  } = useDockerApplicationStore();
  const { isDialogOpen, setDialogOpen } = useAppConfigTableDialogStore();

  const container = containers.filter((item) => item.Names[0] === `/${DOCKER_APPLICATIONS[settingLocation]}`);

  useEffect(() => {
    if (!eventSource) return undefined;
    const dockerProgressHandler = (e: MessageEvent<string>) => {
      const { status, progress } = JSON.parse(e.data) as DockerEvent;
      if (!progress) return;
      setDockerProgress((prevDockerProgress) => [...prevDockerProgress, `${status} ${t(progress) ?? ''}`]);
    };

    eventSource.addEventListener(SSE_MESSAGE_TYPE.MESSAGE, dockerProgressHandler);

    return () => {
      eventSource.removeEventListener(SSE_MESSAGE_TYPE.MESSAGE, dockerProgressHandler);
    };
  }, []);

  useEffect(() => {
    if (Object.keys(DOCKER_APPLICATIONS).includes(settingLocation)) {
      const containeName = DOCKER_APPLICATIONS[settingLocation] || '';
      const getDockerConfig = async () => {
        const config = await getDockerContainerConfig(settingLocation, containeName);
        setDockerConfig(config);
      };
      void getDockerConfig();
    }
  }, [settingLocation]);

  const handleCreateContainer = async () => {
    const createContainerConfig = convertComposeToDockerode(dockerConfig);
    await createAndRunContainer(createContainerConfig[0]);
  };

  const getDialogBody = () => <ProgressTextArea text={dockerProgress} />;

  const getDialogFooter = () => (
    <div className="flex justify-end gap-2">
      <Button
        variant="btn-outline"
        size="lg"
        type="button"
        className="w-24 border-2"
        onClick={() => setDialogOpen(false)}
      >
        {container.length === 0 ? t('common.cancel') : t('common.close')}{' '}
      </Button>
      <Button
        variant="btn-collaboration"
        size="lg"
        type="button"
        className="w-24"
        onClick={handleCreateContainer}
        disabled={container.length !== 0}
      >
        {t('common.install')}
      </Button>
    </div>
  );

  return (
    <AdaptiveDialog
      title={t(`dockerApplication.dialogTitle`, { applicationName: t(`${settingLocation}.sidebar`) })}
      isOpen={isDialogOpen}
      body={getDialogBody()}
      footer={getDialogFooter()}
      handleOpenChange={() => setDialogOpen(false)}
    />
  );
};

export default CreateDockerContainerDialog;
