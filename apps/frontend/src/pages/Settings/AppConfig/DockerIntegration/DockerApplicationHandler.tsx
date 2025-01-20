import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AccordionContent, AccordionItem, AccordionSH, AccordionTrigger } from '@/components/ui/AccordionSH';
import { type ContainerInfo } from 'dockerode';
import { Card, CardContent } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import ProgressTextArea from '@/components/shared/ProgressTextArea';
import Field from '@/components/shared/Field';
import EDU_API_ROOT from '@libs/common/constants/eduApiRoot';
import SSE_MESSAGE_TYPE from '@libs/common/constants/sseMessageType';
import type DockerEvent from '@libs/docker/types/dockerEvents';
import type TApps from '@libs/appconfig/types/appsType';
import useUserStore from '@/store/UserStore/UserStore';
import APPS from '@libs/appconfig/constants/apps';
import DOCKER_APPLICATIONS from '@libs/docker/constants/dockerApplicationList';
import useDockerApplicationStore from './useDockerApplicationStore';

type DockerApplicationHandlerProps = {
  settingLocation: TApps;
};

const DockerApplicationHandler: React.FC<DockerApplicationHandlerProps> = ({ settingLocation }) => {
  const { t } = useTranslation();
  const { eduApiToken } = useUserStore();
  const { containers, fetchContainers, createAndRunContainer } = useDockerApplicationStore();
  const [dockerProgress, setDockerProgress] = useState(['']);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const containerName = `/${DOCKER_APPLICATIONS[settingLocation]?.name}`;
  const container = containers.filter((item) => item.Names[0] === containerName);

  useEffect(() => {
    void fetchContainers();
  }, []);

  useEffect(() => {
    const eventSource = new EventSource(`/${EDU_API_ROOT}/docker/sse?token=${eduApiToken}`);

    const dockerProgressHandler = (e: MessageEvent<string>) => {
      const { status, progress } = JSON.parse(e.data) as DockerEvent;
      setDockerProgress((prevDockerProgress) => [...prevDockerProgress, `${status} ${progress ?? ''}`]);
    };

    eventSource.addEventListener(SSE_MESSAGE_TYPE.CREATED, dockerProgressHandler);

    return () => {
      eventSource.removeEventListener(SSE_MESSAGE_TYPE.CREATED, dockerProgressHandler);
      eventSource.close();
    };
  }, [eduApiToken]);

  const handleCreateContainer = async () => {
    const createContainerConfig = DOCKER_APPLICATIONS[settingLocation];
    if (!createContainerConfig) return;
    await createAndRunContainer(createContainerConfig);
  };

  const getDialogBody = () => <ProgressTextArea text={dockerProgress} />;
  const getDialogFooter = () => (
    <div className="flex justify-end gap-2">
      <Button
        variant="btn-outline"
        size="lg"
        type="button"
        className="w-24 border-2"
        onClick={() => setIsDialogOpen(false)}
      >
        {t('common.cancel')}
      </Button>
      <Button
        variant="btn-collaboration"
        size="lg"
        type="button"
        className="w-24"
        onClick={handleCreateContainer}
      >
        {container.length === 0 ? t('common.install') : t('common.update')}
      </Button>
    </div>
  );

  const containerToShow = () => {
    const imageName = DOCKER_APPLICATIONS[settingLocation]?.Image || '';

    if (container.length === 0) {
      const emptyContainer: ContainerInfo[] = [
        {
          Id: imageName,
          Names: [containerName],
          Image: imageName,
          ImageID: '',
          Command: '',
          Created: 0,
          Ports: [],
          Labels: {},
          State: '',
          Status: '',
          HostConfig: {
            NetworkMode: '',
          },
          NetworkSettings: {
            Networks: {},
          },
          Mounts: [],
        },
      ];
      return emptyContainer;
    }
    return container;
  };

  return (
    <>
      <AccordionSH type="multiple">
        <AccordionItem value="docker">
          <AccordionTrigger>
            <h4>{t(`dockerApplication.title`)}</h4>
          </AccordionTrigger>
          <AccordionContent className="flex flex-wrap justify-between px-1">
            <div className="min-w-64 md:w-1/2">
              <p className="text-wrap break-words">{t(`dockerApplication.${settingLocation}Description`)}</p>
              <Button
                variant="btn-collaboration"
                type="button"
                size="lg"
                className="mt-5 w-24"
                onClick={() => setIsDialogOpen(true)}
                disabled={container.length > 0}
              >
                {t('common.install')}
              </Button>
            </div>

            <div className="flex w-1/2 min-w-64 justify-end">
              {containerToShow().map((item) => (
                <Card
                  key={item.Id}
                  variant="text"
                  className="my-2 ml-1 mr-4 h-80 w-full"
                  aria-label={item.Id}
                >
                  <CardContent className="flex flex-col gap-2">
                    <h4 className="mb-4 flex items-center justify-between font-bold">{item.Names[0].split('/')[1]}</h4>
                    <Field
                      key="dockerOverview-container"
                      value={item.Image}
                      labelTranslationId="dockerOverview.containerName"
                      readOnly
                      variant="lightGrayDisabled"
                    />
                    <Field
                      key="dockerOverview-state"
                      value={item.State}
                      labelTranslationId="dockerOverview.state"
                      readOnly
                      variant="lightGrayDisabled"
                    />
                    <Field
                      key="dockerOverview-status"
                      value={item.Status}
                      labelTranslationId="dockerOverview.status"
                      readOnly
                      variant="lightGrayDisabled"
                    />
                  </CardContent>
                </Card>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </AccordionSH>
      <AdaptiveDialog
        title={t(`dockerApplication.dialogTitle`, { applicationName: APPS.MAIL.toUpperCase() })}
        isOpen={isDialogOpen}
        body={getDialogBody()}
        footer={getDialogFooter()}
        handleOpenChange={() => setIsDialogOpen(false)}
      />
    </>
  );
};

export default DockerApplicationHandler;
