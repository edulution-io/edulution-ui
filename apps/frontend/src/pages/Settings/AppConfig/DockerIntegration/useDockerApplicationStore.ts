import { create } from 'zustand';
import handleApiError from '@/utils/handleApiError';
import eduApi from '@/api/eduApi';
import { type ContainerInfo } from 'dockerode';

type DockerApplicationStore = {
  containers: ContainerInfo[];
  loading: boolean;
  error: string | null;
  fetchContainers: () => Promise<void>;
};

const useDockerApplicationStore = create<DockerApplicationStore>((set) => ({
  containers: [],
  loading: true,
  error: null,

  fetchContainers: async () => {
    set({ loading: true, error: null });
    try {
      const { data } = await eduApi.get<ContainerInfo[]>('docker/containers');
      set({ containers: data });
    } catch (error) {
      handleApiError(error, set);
    } finally {
      set({ loading: false });
    }
  },

  createContainer: async () => {
    set({ loading: true, error: null });
    try {
      await eduApi.post('docker/containers', undefined, {
        params: { fromImage: 'hello-world', tag: 'latest' },
      });
    } catch (error) {
      handleApiError(error, set);
    } finally {
      set({ loading: false });
    }
  },
}));

export default useDockerApplicationStore;
