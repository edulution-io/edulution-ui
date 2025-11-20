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

import { type RowSelectionState } from '@tanstack/react-table';
import { type ContainerInfo } from 'dockerode';
import { type YAMLMap } from 'yaml';
import type AppConfigTable from '@libs/bulletinBoard/types/appConfigTable';
import type TDockerCommands from '@libs/docker/types/TDockerCommands';
import type DockerCompose from '@libs/docker/types/dockerCompose';
import type CreateContainerDto from '@libs/docker/types/create-container.dto';
import type TApps from './appsType';

export interface DockerContainerTableStore extends AppConfigTable<ContainerInfo> {
  containers: ContainerInfo[];
  selectedRows: RowSelectionState;
  setSelectedRows: (selectedRows: RowSelectionState) => void;
  isLoading: boolean;
  error: string | null;
  dockerContainerConfig: DockerCompose | null;
  traefikConfig: YAMLMap | null;
  dockerComposeFiles: Record<string, string>;
  getContainers: (applicationNames?: string[]) => Promise<ContainerInfo[]>;
  updateContainers: (containers: ContainerInfo[]) => void;
  createAndRunContainer: (createContainerDto: CreateContainerDto) => Promise<void>;
  runDockerCommand: (containerNames: string[], operation: TDockerCommands) => Promise<void>;
  deleteDockerContainer: (containerNames: string[]) => Promise<void>;
  getDockerContainerConfig: (applicationName: TApps, containerName: string) => Promise<DockerCompose>;
  getTraefikConfig: (applicationName: TApps, containerName: string) => Promise<void>;
  updateContainer: (containerNames: string[]) => Promise<void>;
  reset: () => void;
}
