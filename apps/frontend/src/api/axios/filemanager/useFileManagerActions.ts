import useFileManagerStore from '@/store/fileManagerStore';
import useCustomAxiosFileManager from '@/api/axios/filemanager/useCustomAxiosFileManager.ts';

const useFileManagerActions = () => {
  const fileManagerAxios = useCustomAxiosFileManager();
  const fetchFiles = (path: string) => useFileManagerStore.getState().fetchFiles(path, fileManagerAxios);
  const fetchMountPoints = () => useFileManagerStore.getState().fetchMountPoints(fileManagerAxios);

  const fetchQrCode = () => useFileManagerStore.getState().fetchQRCode(fileManagerAxios);

  return {
    fetchFiles,
    fetchMountPoints,
    fetchQrCode,
  };
};

export default useFileManagerActions;
