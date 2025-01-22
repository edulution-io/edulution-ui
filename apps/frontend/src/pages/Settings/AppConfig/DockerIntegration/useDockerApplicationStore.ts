import { create } from 'zustand';
import axios from 'axios';
import { parse } from 'yaml';
import eduApi from '@/api/eduApi';
import { type ContainerInfo, type ContainerCreateOptions } from 'dockerode';
import { type RowSelectionState } from '@tanstack/react-table';
import handleApiError from '@/utils/handleApiError';
import useUserStore from '@/store/UserStore/UserStore';
import EDU_API_ROOT from '@libs/common/constants/eduApiRoot';
import { type DockerContainerTableStore } from '@libs/appconfig/types/dockerContainerTableStore';
import DOCKER_APPLICATIONS from '@libs/docker/constants/dockerApplicationList';
import type TApps from '@libs/appconfig/types/appsType';
import type DockerCompose from '@libs/docker/types/dockerCompose';
import { EDU_PLUGINS_GITHUB_URL } from '@libs/common/constants';

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

  fetchTableContent: async (applicationName) => {
    if (applicationName) {
      await get().fetchContainers();
      const container = get().containers.filter((item) => item.Names[0] === `/${DOCKER_APPLICATIONS[applicationName]}`);
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

  getDockerContainerConfig: async (applicationName: TApps, containerName: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await axios.get<string>(
        `${EDU_PLUGINS_GITHUB_URL}/${applicationName}/${containerName}/docker-compose.yml`,
        {
          headers: {
            Accept: 'application/vnd.github.v3.raw',
          },
        },
      );
      return parse(data) as DockerCompose;
    } catch (error) {
      handleApiError(error, set);
      return { services: {} };
    } finally {
      set({ isLoading: false });
    }
  },

  reset: () => set(initialValues),
}));

export default useDockerApplicationStore;
