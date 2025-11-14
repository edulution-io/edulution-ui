/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
 *
 * This software is dual-licensed under the terms of:
 *
 * 1. The GNU Affero General Public License (AGPL-3.0-or-later), as published by the Free Software Foundation.
 *    You may use, modify and distribute this software under the terms of the AGPL, provided that you comply with its conditions.
 *
 *    A copy of the license can be found at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * OR
 *
 * 2. A commercial license agreement with Netzint GmbH. Licensees holding a valid commercial license from Netzint GmbH
 *    may use this software in accordance with the terms contained in such written agreement, without the obligations imposed by the AGPL.
 *
 * If you are uncertain which license applies to your use case, please contact us at info@netzint.de for clarification.
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
