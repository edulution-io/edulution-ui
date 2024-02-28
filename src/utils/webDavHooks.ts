import { useState } from 'react';
import WebDavFileManager from '@/webdavclient/WebDavFileManager';

import { useFileManagerStore } from '@/store';
import { ContentType, DirectoryFile } from '../../datatypes/filesystem';

const useWebDavActions = () => {
  const [files, setFiles] = useState<DirectoryFile[]>([]);
  const currentPath = useFileManagerStore((state) => state.currentPath);
  const setCurrentPath = useFileManagerStore((state) => state.setCurrentPath);
  const webDavFileManager = new WebDavFileManager();

  const fetchFiles = async (path: string = currentPath): Promise<void> => {
    try {
      console.log(path);
      console.log('Fetching files');
      const directoryFiles = await webDavFileManager.getContentList(path);
      setCurrentPath(path);
      setFiles(directoryFiles);
    } catch (error) {
      console.error('Error fetching directory contents:', error);
    }
  };

  const fetchMountPoints = async (): Promise<DirectoryFile[]> => webDavFileManager.getContentList('/');

  const fetchDirectory = async (path: string = '/teachers/netzint-teacher'): Promise<DirectoryFile[]> => {
    try {
      const resp = await webDavFileManager.getContentList(path);
      return resp.filter((item) => item.type === ContentType.directory);
    } catch (error) {
      console.error('Error fetching directory contents:', error);
      return [];
    }
  };

  const handleWebDavAction = async (action: () => Promise<boolean>): Promise<boolean> => action();

  return { files, fetchDirectory, currentPath, fetchFiles, handleWebDavAction, fetchMountPoints };
};

export default useWebDavActions;
