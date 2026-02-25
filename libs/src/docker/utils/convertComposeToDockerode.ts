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
import DOCKER_NETWORK_MODE from '../constants/dockerNetworkMode';

const NANOSECONDS_PER_SECOND = 1_000_000_000;

const UNIT_TO_SECONDS: Record<string, number> = { h: 3600, m: 60, s: 1, ms: 0.001 };

const parseDurationToSeconds = (duration: string | undefined): number | undefined => {
  if (!duration) return undefined;
  const match = duration.match(/^(\d+)(h|m|ms|s)$/);
  if (!match) return undefined;
  const [, value, unit] = match;
  return Math.round(Number(value) * (UNIT_TO_SECONDS[unit] ?? 1));
};

const parseDurationToNs = (duration: string | undefined): number | undefined => {
  const seconds = parseDurationToSeconds(duration);
  if (seconds === undefined) return undefined;
  return seconds * NANOSECONDS_PER_SECOND;
};

const normalizeEnvToStringArray = (env: string[] | Record<string, string> | undefined): string[] | undefined => {
  if (!env) return undefined;
  if (Array.isArray(env)) return env;
  return Object.entries(env).map(([k, v]) => `${k}=${v}`);
};

const topologicalSort = (services: DockerCompose['services']): string[] => {
  const visited = new Set<string>();
  const inProgress = new Set<string>();
  const result: string[] = [];

  const visit = (name: string): void => {
    if (visited.has(name)) return;
    if (inProgress.has(name)) {
      throw new Error(`Circular dependency detected for service '${name}'`);
    }
    if (!(name in services)) {
      throw new Error(`Unknown service dependency '${name}'`);
    }
    inProgress.add(name);

    const deps = services[name]?.depends_on;
    const depNames = Array.isArray(deps) ? deps : Object.keys(deps ?? {});
    depNames.forEach(visit);

    inProgress.delete(name);
    visited.add(name);
    result.push(name);
  };

  Object.keys(services).forEach(visit);
  return result;
};

const convertComposeToDockerode = (compose: DockerCompose): ContainerCreateOptions[] =>
  topologicalSort(compose.services).map((serviceName) => {
    const service = compose.services[serviceName];
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

    const stopTimeOut = parseDurationToSeconds(service.stop_grace_period);

    const sysctls = service.sysctls?.reduce(
      (acc, sysctl) => {
        const [key, value] = sysctl.split('=');
        acc[key] = value;
        return acc;
      },
      {} as { [key: string]: string },
    );

    const parseCommand = (): string[] | undefined => {
      if (Array.isArray(service.command)) return service.command;
      if (service.command) return ['/bin/sh', '-c', service.command];
      return undefined;
    };
    const cmd = parseCommand();

    const healthcheck = service.healthcheck
      ? {
          Test: service.healthcheck.test,
          Interval: parseDurationToNs(service.healthcheck.interval),
          Timeout: parseDurationToNs(service.healthcheck.timeout),
          StartPeriod: parseDurationToNs(service.healthcheck.start_period),
          Retries: service.healthcheck.retries,
        }
      : undefined;

    const containerOptions: ContainerCreateOptions = {
      name: service.container_name || serviceName,
      Image: service.image,
      OpenStdin: service.stdin_open,
      StopTimeout: stopTimeOut,
      Env: normalizeEnvToStringArray(service.environment),
      Cmd: cmd,
      Healthcheck: healthcheck,
      HostConfig: {
        Binds: binds,
        PortBindings: portBindings,
        RestartPolicy: service.restart ? { Name: service.restart } : undefined,
        NetworkMode: DOCKER_NETWORK_MODE,
        CapAdd: service.cap_add,
        Sysctls: sysctls,
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
