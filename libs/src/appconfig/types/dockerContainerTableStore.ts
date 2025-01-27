import { type RowSelectionState } from '@tanstack/react-table';
import { type ContainerCreateOptions, type ContainerInfo } from 'dockerode';
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
  eventSource: EventSource | null;
  dockerContainerConfig: DockerCompose | null;
  setEventSource: () => void;
  getContainers: () => Promise<void>;
  updateContainers: (containers: ContainerInfo[]) => void;
  createAndRunContainer: (createContainerDto: ContainerCreateOptions[]) => Promise<void>;
  runDockerCommand: (containerNames: string[], operation: TDockerCommands) => Promise<void>;
  deleteDockerContainer: (containerNames: string[]) => Promise<void>;
  getDockerContainerConfig: (applicationName: TApps, containerName: string) => Promise<DockerCompose>;
  reset: () => void;
}
