import { useState } from 'react';
import WebDavFunctions from '@/webdavclient/WebDavFileManager';

import { useFileManagerStore } from '@/store';
import { ContentType, DirectoryFile } from '../../datatypes/filesystem';

const useWebDavActions = () => {
  const [files, setFiles] = useState<DirectoryFile[]>([]);
  const currentPath = useFileManagerStore((state) => state.currentPath);
  const setCurrentPath = useFileManagerStore((state) => state.setCurrentPath);

  const fetchFiles = async (path: string = currentPath): Promise<void> => {
    try {
      console.log(path);
      console.log('Fetching files');
      const directoryFiles = await WebDavFunctions.getContentList(path);
      setCurrentPath(path);
      setFiles(directoryFiles);
    } catch (error) {
      console.error('Error fetching directory contents:', error);
    }
  };

  const fetchMountPoints = async (): Promise<DirectoryFile[]> => WebDavFunctions.getContentList('/');

  const fetchDirectory = async (path: string = '/teachers/netzint-teacher'): Promise<DirectoryFile[]> => {
    try {
      const resp = await WebDavFunctions.getContentList(path);
      return resp.filter((item) => item.type === ContentType.directory);
    } catch (error) {
      console.error('Error fetching directory contents:', error);
      return [];
    }
  };

  const handleWebDavAction = async (
    action: () => Promise<
      | { success: boolean; message: string; status: number }
      | {
          success: boolean;
        }
    >,
  ): Promise<
    | { success: boolean; message: string; status: number }
    | {
        success: boolean;
      }
  > => action();

  return { files, fetchDirectory, currentPath, fetchFiles, handleWebDavAction, fetchMountPoints };
};

export default useWebDavActions;
