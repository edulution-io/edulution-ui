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

import { useEffect } from 'react';
import useDockerApplicationStore from '@/pages/Settings/AppConfig/DockerIntegration/useDockerApplicationStore';
import SSE_MESSAGE_TYPE from '@libs/common/constants/sseMessageType';
import { ContainerInfo } from 'dockerode';
import useLdapGroups from './useLdapGroups';

const useDockerContainerEvents = () => {
  const { eventSource, setEventSource, updateContainers } = useDockerApplicationStore();
  const { isSuperAdmin, isAuthReady } = useLdapGroups();

  useEffect(() => {
    if (isSuperAdmin && isAuthReady) {
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
