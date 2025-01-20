import { create } from 'zustand';
import handleApiError from '@/utils/handleApiError';
import eduApi from '@/api/eduApi';
import type { ContainerInfo, ContainerCreateOptions } from 'dockerode';
import TDockerCommands from '@libs/docker/types/TDockerCommands';
import EDU_API_ROOT from '@libs/common/constants/eduApiRoot';
import useUserStore from '@/store/UserStore/UserStore';
import { RowSelectionState } from '@tanstack/react-table';

type DockerApplicationStore = {
  selectedRows: RowSelectionState;
  setSelectedRows: (selectedRows: RowSelectionState) => void;
  containers: ContainerInfo[];
  isLoading: boolean;
  error: string | null;
  eventSource: EventSource | null;
  setEventSource: () => void;
  fetchContainers: () => Promise<void>;
  createAndRunContainer: (createContainerDto: ContainerCreateOptions) => Promise<void>;
  runDockerCommand: (id: string, operation: TDockerCommands) => Promise<void>;
  deleteDockerContainer: (id: string) => Promise<void>;
};

const useDockerApplicationStore = create<DockerApplicationStore>((set) => ({
  containers: [],
  isLoading: true,
  error: null,
  eventSource: null,
  selectedRows: {},

  setSelectedRows: (selectedRows: RowSelectionState) => set({ selectedRows }),

  setEventSource: () =>
    set({ eventSource: new EventSource(`/${EDU_API_ROOT}/docker/sse?token=${useUserStore.getState().eduApiToken}`) }),

  fetchContainers: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await eduApi.get<ContainerInfo[]>('docker/containers');
      set({ containers: data });
    } catch (error) {
      handleApiError(error, set);
    } finally {
      set({ isLoading: false });
    }
  },

  createAndRunContainer: async (createContainerDto: ContainerCreateOptions) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await eduApi.post<ContainerInfo[]>('docker/containers', createContainerDto);
      set({ containers: data });
    } catch (error) {
      handleApiError(error, set);
    } finally {
      set({ isLoading: false });
    }
  },

  runDockerCommand: async (id: string, operation: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await eduApi.put<ContainerInfo[]>(`docker/containers/${id}/${operation}`);
      set({ containers: data });
    } catch (error) {
      handleApiError(error, set);
    } finally {
      set({ isLoading: false });
    }
  },

  deleteDockerContainer: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await eduApi.delete(`docker/containers/${id}`);
    } catch (error) {
      handleApiError(error, set);
    } finally {
      set({ isLoading: false });
    }
  },
}));

export default useDockerApplicationStore;
