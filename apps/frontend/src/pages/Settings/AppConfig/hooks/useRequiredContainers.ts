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

import { useEffect, useMemo, useState } from 'react';
import { type ContainerInfo } from 'dockerode';
import useDockerApplicationStore from '@/pages/Settings/AppConfig/DockerIntegration/useDockerApplicationStore';
import DOCKER_STATES from '@libs/docker/constants/dockerStates';

type UseRequiredContainersResult = {
  areRequiredContainersRunning: boolean;
  hasFetched: boolean;
  isDisabled: boolean;
};

const useRequiredContainers = (requiredContainers?: string[]): UseRequiredContainersResult => {
  const { getContainers } = useDockerApplicationStore();
  const [hasFetched, setHasFetched] = useState(false);
  const [allContainers, setAllContainers] = useState<ContainerInfo[] | null>(null);

  useEffect(() => {
    const fetchContainers = async () => {
      try {
        setAllContainers(await getContainers());
      } finally {
        setHasFetched(true);
      }
    };

    if (requiredContainers && requiredContainers.length > 0) {
      void fetchContainers();
    } else {
      setHasFetched(true);
    }
  }, [getContainers, (requiredContainers ?? []).join('|')]);

  const areRequiredContainersRunning = useMemo(() => {
    if (!requiredContainers || requiredContainers.length === 0) return true;
    if (!allContainers) return false;

    return requiredContainers.every((name) =>
      allContainers.some((containerInfo) => {
        const names = (containerInfo as unknown as { Names?: string[] }).Names || [];
        const matchesName = names.some((n) => n === `/${name}` || n === name);
        return matchesName && containerInfo.State === DOCKER_STATES.RUNNING;
      }),
    );
  }, [allContainers, (requiredContainers ?? []).join('|')]);

  const isDisabled = !!requiredContainers?.length && !areRequiredContainersRunning;

  return {
    areRequiredContainersRunning,
    hasFetched,
    isDisabled,
  };
};

export default useRequiredContainers;
