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

import { type ContainerCreateOptions } from 'dockerode';
import type DockerCompose from '../types/dockerCompose';

const convertComposeToDockerode = (compose: DockerCompose): ContainerCreateOptions[] =>
  Object.entries(compose.services).map(([serviceName, service]) => {
    const volumes = service.volumes?.reduce(
      (acc, volume) => {
        const [, containerPath] = volume.split(':');
        acc[containerPath] = {};
        return acc;
      },
      {} as { [key: string]: object },
    );

    const binds = service.volumes?.map((volume) => {
      const [source, target] = volume.split(':');
      return `${source}:${target}`;
    });

    const portBindings = service.ports?.reduce(
      (acc, port) => {
        const [hostPort, containerPort] = port.split(':');
        acc[`${containerPort}/tcp`] = [{ HostPort: hostPort }];
        return acc;
      },
      {} as { [key: string]: { HostPort: string }[] },
    );

    const exposedPorts = service.ports?.reduce(
      (acc, port) => {
        const [, containerPort] = port.split(':');
        acc[`${containerPort}/tcp`] = {};
        return acc;
      },
      {} as { [key: string]: object },
    );

    const stopTimeOut = service.stop_grace_period ? Number(service.stop_grace_period.split('s')[0]) : undefined;

    const containerOptions: ContainerCreateOptions = {
      name: service.container_name,
      Image: service.image,
      OpenStdin: service.stdin_open,
      StopTimeout: stopTimeOut,
      Env: service.environment || undefined,
      Cmd: service.command ? service.command.split(' ') : undefined,
      HostConfig: {
        Binds: binds,
        PortBindings: portBindings,
        RestartPolicy: service.restart ? { Name: service.restart } : undefined,
        NetworkMode: 'edulution-ui_default',
      },
      ExposedPorts: exposedPorts,
      Labels: {
        'com.docker.compose.service': serviceName,
      },
      Volumes: volumes,
    };

    return containerOptions;
  });

export default convertComposeToDockerode;
