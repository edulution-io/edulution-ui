import { RowSelectionState } from '@tanstack/react-table';
import { type ContainerCreateOptions, type ContainerInfo } from 'dockerode';
import type AppConfigTable from '@libs/bulletinBoard/types/appConfigTable';
import TDockerCommands from '@libs/docker/types/TDockerCommands';

export interface DockerContainerTableStore extends AppConfigTable<ContainerInfo> {
  containers: ContainerInfo[];
  selectedRows: RowSelectionState;
  setSelectedRows: (selectedRows: RowSelectionState) => void;
  isLoading: boolean;
  error: string | null;
  eventSource: EventSource | null;
  setEventSource: () => void;
  fetchContainers: () => Promise<void>;
  updateContainers: (containers: ContainerInfo[]) => void;
  createAndRunContainer: (createContainerDto: ContainerCreateOptions) => Promise<void>;
  runDockerCommand: (id: string, operation: TDockerCommands) => Promise<void>;
  deleteDockerContainer: (id: string) => Promise<void>;
  reset: () => void;
}
