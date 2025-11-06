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

import { create } from 'zustand';
import axios from 'axios';
import { parse, type YAMLMap } from 'yaml';
import i18n from '@/i18n';
import { toast } from 'sonner';
import eduApi from '@/api/eduApi';
import { type ContainerInfo, type ContainerCreateOptions } from 'dockerode';
import { type RowSelectionState } from '@tanstack/react-table';
import handleApiError from '@/utils/handleApiError';
import DOCKER_APPLICATIONS from '@libs/docker/constants/dockerApplicationList';
import { EDU_API_DOCKER_CONTAINER_ENDPOINT, EDU_API_DOCKER_ENDPOINT } from '@libs/docker/constants/dockerEndpoints';
import { EDU_PLUGINS_GITHUB_URL } from '@libs/common/constants';
import { type DockerContainerTableStore } from '@libs/appconfig/types/dockerContainerTableStore';
import type TApps from '@libs/appconfig/types/appsType';
import type DockerCompose from '@libs/docker/types/dockerCompose';
import { RequestResponseContentType } from '@libs/common/types/http-methods';
import type UpdateContainerResponse from '@libs/docker/types/updateContainerResponse';

const initialValues = {
  containers: [],
  tableContentData: [],
  isLoading: true,
  error: null,
  selectedRows: {},
  dockerContainerConfig: null,
  traefikConfig: null,
};

const useDockerApplicationStore = create<DockerContainerTableStore>((set, get) => ({
  ...initialValues,

  setSelectedRows: (selectedRows: RowSelectionState) => set({ selectedRows }),

  setIsLoading: (isLoading: boolean) => set({ isLoading }),

  updateContainers: (containers: ContainerInfo[]) => set({ containers }),

  fetchTableContent: async (applicationName) => {
    if (applicationName) {
      if (Object.keys(DOCKER_APPLICATIONS).includes(applicationName)) {
        set({ isLoading: true, error: null });
        const containerName = DOCKER_APPLICATIONS[applicationName] || '';
        const dockerContainerConfig = await get().getDockerContainerConfig(applicationName, containerName);
        const applicationNames = Object.keys(dockerContainerConfig.services);
        const containers = await get().getContainers(applicationNames);

        set({ tableContentData: containers });
      }
      set({ traefikConfig: null });
    }
  },

  getContainers: async (applicationNames?: string[]) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await eduApi.get<ContainerInfo[]>(
        `${EDU_API_DOCKER_ENDPOINT}/${EDU_API_DOCKER_CONTAINER_ENDPOINT}`,
        { params: { applicationNames } },
      );
      set({ containers: data });
      return data;
    } catch (error) {
      handleApiError(error, set);
      return [];
    } finally {
      set({ isLoading: false });
    }
  },

  createAndRunContainer: async (createContainerDto: ContainerCreateOptions[]) => {
    set({ isLoading: true, error: null });
    try {
      await eduApi.post(`${EDU_API_DOCKER_ENDPOINT}/${EDU_API_DOCKER_CONTAINER_ENDPOINT}`, createContainerDto);
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
        containerNames.map((containerName) =>
          eduApi.put(`${EDU_API_DOCKER_ENDPOINT}/${EDU_API_DOCKER_CONTAINER_ENDPOINT}/${containerName}/${operation}`),
        ),
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
      await Promise.all(
        containerNames.map((containerName) =>
          eduApi.delete(`${EDU_API_DOCKER_ENDPOINT}/${EDU_API_DOCKER_CONTAINER_ENDPOINT}/${containerName}`),
        ),
      );
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
            Accept: RequestResponseContentType.APPLICATION_GITHUB_RAW,
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

  getTraefikConfig: async (applicationName: TApps, containerName: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get<string>(
        `${EDU_PLUGINS_GITHUB_URL}/${applicationName}/${containerName}/${applicationName}.yml`,
        {
          headers: {
            Accept: RequestResponseContentType.APPLICATION_GITHUB_RAW,
          },
          validateStatus: (status) => status === 200 || status === 404,
        },
      );

      let traefikConfig: YAMLMap | null = null;
      if (response.status === 200) {
        traefikConfig = parse(response.data) as YAMLMap;
      }
      set({ traefikConfig });
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status !== 404) {
        handleApiError(error, set);
        set({ traefikConfig: null });
      }
    } finally {
      set({ isLoading: false });
    }
  },

  updateContainer: async (containerNames: string[]) => {
    set({ isLoading: true, error: null });
    try {
      await Promise.all(
        containerNames.map(async (containerName) => {
          const { data } = await eduApi.patch<UpdateContainerResponse>(
            `${EDU_API_DOCKER_ENDPOINT}/${EDU_API_DOCKER_CONTAINER_ENDPOINT}/${containerName}`,
          );

          const { isImageUpdated } = data;

          if (!isImageUpdated) {
            toast.info(i18n.t('docker.events.containerAlreadyUpToDate', { containerName }));
            return;
          }

          toast.success(i18n.t('docker.events.containerUpdateSuccessful', { containerName }));
        }),
      );
    } catch (error) {
      handleApiError(error, set);
    } finally {
      set({ isLoading: false });
    }
  },

  reset: () => set(initialValues),
}));

export default useDockerApplicationStore;
