import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/shared/Button';
import ProgressTextArea from '@/components/shared/ProgressTextArea';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import SSE_MESSAGE_TYPE from '@libs/common/constants/sseMessageType';
import type DockerEvent from '@libs/docker/types/dockerEvents';
import type TApps from '@libs/appconfig/types/appsType';
import convertComposeToDockerode from '@libs/docker/utils/convertComposeToDockerode';
import useDockerApplicationStore from './useDockerApplicationStore';
import useAppConfigTableDialogStore from '../components/table/useAppConfigTableDialogStore';

interface CreateDockerContainerDialogProps {
  settingLocation: TApps;
}

const CreateDockerContainerDialog: React.FC<CreateDockerContainerDialogProps> = ({ settingLocation }) => {
  const { t } = useTranslation();
  const [dockerProgress, setDockerProgress] = useState(['']);
  const { eventSource, tableContentData, dockerContainerConfig, createAndRunContainer } = useDockerApplicationStore();
  const { isDialogOpen, setDialogOpen } = useAppConfigTableDialogStore();

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

  const handleCreateContainer = async () => {
    if (dockerContainerConfig) {
      const createContainerConfig = convertComposeToDockerode(dockerContainerConfig);
      await createAndRunContainer(createContainerConfig);
    }
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
        {tableContentData.length === 0 ? t('common.cancel') : t('common.close')}{' '}
      </Button>
      <Button
        variant="btn-collaboration"
        size="lg"
        type="button"
        className="w-24"
        onClick={handleCreateContainer}
        disabled={tableContentData.length !== 0}
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
