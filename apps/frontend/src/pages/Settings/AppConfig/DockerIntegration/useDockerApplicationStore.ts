import { create } from 'zustand';
import handleApiError from '@/utils/handleApiError';
import eduApi from '@/api/eduApi';
import { type ContainerInfo } from 'dockerode';
import TDockerCommands from '@libs/docker/types/TDockerCommands';

type DockerApplicationStore = {
  containers: ContainerInfo[];
  isLoading: boolean;
  error: string | null;
  fetchContainers: () => Promise<void>;
  createAndRunContainer: (image: string, tag: string) => Promise<void>;
  runDockerCommand: (id: string, operation: TDockerCommands) => Promise<void>;
  deleteDockerContainer: (id: string) => Promise<void>;
};

const useDockerApplicationStore = create<DockerApplicationStore>((set) => ({
  containers: [],
  isLoading: true,
  error: null,

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

  createAndRunContainer: async (image: string, tag: string) => {
    set({ isLoading: true, error: null });
    try {
      await eduApi.post('docker/containers', { image, tag });
    } catch (error) {
      handleApiError(error, set);
    } finally {
      set({ isLoading: false });
    }
  },

  runDockerCommand: async (id: string, operation: string) => {
    set({ isLoading: true, error: null });
    try {
      await eduApi.put(`docker/containers/${id}/${operation}`);
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
