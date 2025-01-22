import { type ContainerCreateOptions } from 'dockerode';
import type DockerCompose from '../types/dockerCompose';

function convertComposeToDockerode(compose: DockerCompose): ContainerCreateOptions[] {
  return Object.entries(compose.services).map(([serviceName, service]) => {
    const volumes = service.volumes?.reduce(
      (acc, volume) => {
        const [, containerPath] = volume.split(':');
        acc[containerPath] = {};
        return acc;
      },
      {} as { [key: string]: object },
    );

    const environment = service.environment
      ? Object.entries(service.environment).map(([key, value]) => `${key}=${value}`)
      : undefined;

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

    const containerOptions: ContainerCreateOptions = {
      name: service.container_name,
      Image: service.image,
      Env: environment,
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
}

export default convertComposeToDockerode;
