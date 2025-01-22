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

    const containerOptions: ContainerCreateOptions = {
      name: service.container_name,
      Image: service.image,
      Env: service.environment,
      Cmd: service.command ? service.command.split(' ') : undefined,
      HostConfig: {
        Binds: service.volumes,
        PortBindings: service.ports
          ? service.ports.reduce(
              (acc, port) => {
                const [hostPort, containerPort] = port.split(':');
                acc[`${containerPort}/tcp`] = [{ HostPort: hostPort }];
                return acc;
              },
              {} as { [key: string]: { HostPort: string }[] },
            )
          : undefined,
        RestartPolicy: service.restart ? { Name: service.restart } : undefined,
        NetworkMode: 'edulution-ui_default',
      },
      ExposedPorts: service.ports
        ? service.ports.reduce(
            (acc, port) => {
              const [, containerPort] = port.split(':');
              acc[`${containerPort}/tcp`] = {};
              return acc;
            },
            {} as { [key: string]: object },
          )
        : undefined,
      Labels: {
        'com.docker.compose.service': serviceName,
      },
      Volumes: volumes,
    };

    return containerOptions;
  });
}

export default convertComposeToDockerode;
