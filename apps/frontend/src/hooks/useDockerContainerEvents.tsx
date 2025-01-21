import { useEffect } from 'react';
import useDockerApplicationStore from '@/pages/Settings/AppConfig/DockerIntegration/useDockerApplicationStore';
import SSE_MESSAGE_TYPE from '@libs/common/constants/sseMessageType';
import { ContainerInfo } from 'dockerode';
import useLdapGroups from './useLdapGroups';

const useDockerContainerEvents = () => {
  const { eventSource, setEventSource, updateContainers } = useDockerApplicationStore();
  const { isSuperAdmin, authReady } = useLdapGroups();

  useEffect(() => {
    if (isSuperAdmin && authReady) {
      setEventSource();
    }
  }, [isSuperAdmin]);

  useEffect(() => {
    if (eventSource) {
      const updateTableHandler = (e: MessageEvent<string>) => {
        const containerDto = JSON.parse(e.data) as ContainerInfo[];
        if (!containerDto) return;
        updateContainers(containerDto);
      };

      eventSource.addEventListener(SSE_MESSAGE_TYPE.UPDATED, updateTableHandler);

      return () => {
        eventSource.removeEventListener(SSE_MESSAGE_TYPE.UPDATED, updateTableHandler);
        eventSource.close();
      };
    }
    return undefined;
  }, [eventSource]);
};

export default useDockerContainerEvents;
