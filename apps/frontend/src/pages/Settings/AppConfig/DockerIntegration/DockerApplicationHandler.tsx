import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PlusIcon } from '@radix-ui/react-icons';
import { AccordionContent, AccordionItem, AccordionSH, AccordionTrigger } from '@/components/ui/AccordionSH';
import { Card, CardContent } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import ProgressTextArea from '@/components/shared/ProgressTextArea';
import EDU_API_ROOT from '@libs/common/constants/eduApiRoot';
import SSE_MESSAGE_TYPE from '@libs/common/constants/sseMessageType';
import type DockerEvent from '@libs/docker/types/dockerEvents';
import useUserStore from '@/store/UserStore/UserStore';
import useDockerApplicationStore from './useDockerApplicationStore';

const DockerApplicationHandler: React.FC = () => {
  const { t } = useTranslation();
  const { eduApiToken } = useUserStore();
  const { containers, fetchContainers, createAndRunContainer } = useDockerApplicationStore();
  const [dockerProgress, setDockerProgress] = useState(['']);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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
    setIsDialogOpen(true);
    await createAndRunContainer('nginx', 'latest');
  };

  const getDialogBody = () => <ProgressTextArea text={dockerProgress} />;
  const getDialogFooter = () => (
    <Button
      variant="btn-collaboration"
      type="button"
      onClick={() => setIsDialogOpen(false)}
    >
      {t('common.close')}
    </Button>
  );

  return (
    <>
      <AccordionSH type="multiple">
        <AccordionItem value="docker">
          <AccordionTrigger className="flex text-h4">
            <h4>{t(`dockerApplication.title`)}</h4>
          </AccordionTrigger>
          <AccordionContent className="flex flex-wrap items-center justify-between space-y-2 px-1">
            {containers.map((item) =>
              item.Names[0] === '/edulution-mail' ? (
                <Card
                  key={item.Id}
                  variant={item.State === 'running' ? 'infrastructure' : 'collaboration'}
                  className="grid w-72 grid-cols-3 gap-4 p-4 shadow"
                  aria-label={item.Id}
                >
                  <CardContent className="flex flex-col gap-2">
                    <p>{item.Names[0]}</p>
                  </CardContent>
                </Card>
              ) : null,
            )}
            {!containers.some((item) => item.Names[0] === '/edulution-mail') ? (
              <Button
                variant="btn-outline"
                type="button"
                className="flex items-center justify-center border-2"
                onClick={handleCreateContainer}
              >
                <PlusIcon />
              </Button>
            ) : null}
          </AccordionContent>
        </AccordionItem>
      </AccordionSH>
      <AdaptiveDialog
        title="Create Container"
        isOpen={isDialogOpen}
        body={getDialogBody()}
        footer={getDialogFooter()}
        handleOpenChange={() => setIsDialogOpen(false)}
      />
    </>
  );
};

export default DockerApplicationHandler;
