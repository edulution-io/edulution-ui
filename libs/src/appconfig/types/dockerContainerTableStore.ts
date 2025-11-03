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

import { type RowSelectionState } from '@tanstack/react-table';
import { type ContainerCreateOptions, type ContainerInfo } from 'dockerode';
import { type YAMLMap } from 'yaml';
import type AppConfigTable from '@libs/bulletinBoard/types/appConfigTable';
import type TDockerCommands from '@libs/docker/types/TDockerCommands';
import type DockerCompose from '@libs/docker/types/dockerCompose';
import type TApps from './appsType';

export interface DockerContainerTableStore extends AppConfigTable<ContainerInfo> {
  containers: ContainerInfo[];
  selectedRows: RowSelectionState;
  setSelectedRows: (selectedRows: RowSelectionState) => void;
  isLoading: boolean;
  error: string | null;
  dockerContainerConfig: DockerCompose | null;
  traefikConfig: YAMLMap | null;
  getContainers: (applicationNames?: string[]) => Promise<ContainerInfo[]>;
  updateContainers: (containers: ContainerInfo[]) => void;
  createAndRunContainer: (createContainerDto: ContainerCreateOptions[]) => Promise<void>;
  runDockerCommand: (containerNames: string[], operation: TDockerCommands) => Promise<void>;
  deleteDockerContainer: (containerNames: string[]) => Promise<void>;
  getDockerContainerConfig: (applicationName: TApps, containerName: string) => Promise<DockerCompose>;
  getTraefikConfig: (applicationName: TApps, containerName: string) => Promise<void>;
  updateContainer: (containerNames: string[]) => Promise<void>;
  reset: () => void;
}
