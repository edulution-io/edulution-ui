import useFileManagerStore from '@/store/fileManagerStore';
import useCustomAxiosFileManager from '@/api/axios/useCustomAxiosFileManager.ts';

const useFileManagerActions = () => {
  const customFetch = useCustomAxiosFileManager();
  const fetchFiles = (path: string) => useFileManagerStore.getState().fetchFiles(path, customFetch);
  const fetchMountPoints = () => useFileManagerStore.getState().fetchMountPoints(customFetch);

  return { fetchFiles, fetchMountPoints };
};

export default useFileManagerActions;
