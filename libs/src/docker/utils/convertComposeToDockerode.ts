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
