import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import useFileSharingStore from '@/pages/FileSharing/FileSharingStore';
import useFileSharingDialogStore from '@/pages/FileSharing/dialog/FileSharingDialogStore';
import userStore from '@/store/UserStore/UserStore';

const useFileSharingPage = () => {
  const {
    fetchFiles,
    currentPath,
    setPathToRestoreSession,
    pathToRestoreSession,
    isLoading: isFileProcessing,
  } = useFileSharingStore();
  const { isLoading, fileOperationResult } = useFileSharingDialogStore();
  const { user } = userStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const path = searchParams.get('path') || '/';
  const homePath = `${user?.ldapGroups.role}s/${user?.username}`;

  useEffect(() => {
    if (path === '/') {
      if (pathToRestoreSession !== '/') {
        setSearchParams(pathToRestoreSession);
      } else {
        void fetchFiles(homePath);
      }
    } else {
      void fetchFiles(path);
      setPathToRestoreSession(path);
    }
  }, [path, fetchFiles, pathToRestoreSession, setSearchParams, homePath, setPathToRestoreSession]);

  useEffect(() => {
    if (fileOperationResult !== undefined && !isLoading) {
      if (fileOperationResult.success) {
        toast.success(fileOperationResult.message);
        void fetchFiles(currentPath);
      }
    }
  }, [fileOperationResult, isLoading, fetchFiles, currentPath]);

  return { isFileProcessing, isLoading, currentPath, searchParams, setSearchParams };
};

export default useFileSharingPage;