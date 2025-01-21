import { create } from 'zustand';
import handleApiError from '@/utils/handleApiError';
import eduApi from '@/api/eduApi';
import type { ContainerInfo, ContainerCreateOptions } from 'dockerode';
import EDU_API_ROOT from '@libs/common/constants/eduApiRoot';
import useUserStore from '@/store/UserStore/UserStore';
import { RowSelectionState } from '@tanstack/react-table';
import { DockerContainerTableStore } from '@libs/appconfig/types/dockerContainerTableStore';
import DOCKER_APPLICATIONS from '@libs/docker/constants/dockerApplicationList';

const initialValues = {
  containers: [],
  tableContentData: [],
  isLoading: true,
  error: null,
  eventSource: null,
  selectedRows: {},
};

const useDockerApplicationStore = create<DockerContainerTableStore>((set, get) => ({
  ...initialValues,

  setSelectedRows: (selectedRows: RowSelectionState) => set({ selectedRows }),

  setIsLoading: (isLoading: boolean) => set({ isLoading }),

  setEventSource: () =>
    set({ eventSource: new EventSource(`/${EDU_API_ROOT}/docker/sse?token=${useUserStore.getState().eduApiToken}`) }),

  updateContainers: (containers: ContainerInfo[]) => set({ containers }),

  fetchTableContent: (applicationName) => {
    if (applicationName) {
      const containerName = `/${DOCKER_APPLICATIONS[applicationName]?.name}`;
      const container = get().containers.filter((item) => item.Names[0] === containerName);
      set({ tableContentData: container });
    }
  },

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
      await eduApi.post<ContainerInfo[]>('docker/containers', createContainerDto);
    } catch (error) {
      handleApiError(error, set);
    } finally {
      set({ isLoading: false });
    }
  },

  runDockerCommand: async (id: string, operation: string) => {
    set({ isLoading: true, error: null });
    try {
      await eduApi.put<ContainerInfo[]>(`docker/containers/${id}/${operation}`);
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

  reset: () => set(initialValues),
}));

export default useDockerApplicationStore;
