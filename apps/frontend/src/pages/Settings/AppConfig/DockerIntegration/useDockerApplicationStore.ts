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
import type TApps from '@libs/appconfig/types/appsType';
import type DockerCompose from '@libs/docker/types/dockerCompose';
import { EDU_PLUGINS_GITHUB_URL } from '@libs/common/constants';
import DOCKER_APPLICATIONS from '@libs/docker/constants/dockerApplicationList';

const initialValues = {
  containers: [],
  tableContentData: [],
  isLoading: true,
  error: null,
  eventSource: null,
  selectedRows: {},
  dockerContainerConfig: null,
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
      set({ isLoading: true, error: null });
      await get().fetchContainers();

      if (Object.keys(DOCKER_APPLICATIONS).includes(applicationName)) {
        const containerName = DOCKER_APPLICATIONS[applicationName] || '';

        const dockerContainerConfig = await get().getDockerContainerConfig(applicationName, containerName);

        const container = get().containers.filter((item) =>
          Object.keys(dockerContainerConfig.services).includes(item.Names[0].split('/')[1]),
        );
        set({ tableContentData: container });
      }
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

  createAndRunContainer: async (createContainerDto: ContainerCreateOptions[]) => {
    set({ isLoading: true, error: null });
    try {
      await eduApi.post('docker/containers', createContainerDto);
    } catch (error) {
      handleApiError(error, set);
    } finally {
      set({ isLoading: false });
    }
  },

  runDockerCommand: async (containerNames: string[], operation: string) => {
    set({ isLoading: true, error: null });
    try {
      await Promise.all(
        containerNames.map((containerName) => eduApi.put(`docker/containers/${containerName}/${operation}`)),
      );
    } catch (error) {
      handleApiError(error, set);
    } finally {
      set({ isLoading: false });
    }
  },

  deleteDockerContainer: async (containerNames: string[]) => {
    set({ isLoading: true, error: null });
    try {
      await Promise.all(containerNames.map((containerName) => eduApi.delete(`docker/containers/${containerName}`)));
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
      const dockerContainerConfig = parse(data) as DockerCompose;
      set({ dockerContainerConfig });
      return dockerContainerConfig;
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
