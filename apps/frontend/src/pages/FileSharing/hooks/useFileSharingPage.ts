import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import useFileSharingDialogStore from '@/pages/FileSharing/dialog/useFileSharingDialogStore';
import userStore from '@/store/UserStore/UserStore';
import buildHomePath from '@libs/filesharing/utils/buildHomePath';
import useCombinedSSeStore from '@/sse/useSseStore';
import useFileSharingStore from '@/pages/FileSharing/useFileSharingStore';
import SseEventType from '@libs/sse/types/sseEventType';

const useFileSharingPage = () => {
  const {
    fetchMountPoints,
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
  const homePath = buildHomePath(user);
  const { connectFileSharingSseEvent, uploadStatus } = useCombinedSSeStore();
  useEffect(() => {
    if (user) {
      void fetchMountPoints();
    }
  }, [user]);

  useEffect(() => {
    if (!isFileProcessing) {
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
    }
  }, [path, pathToRestoreSession, homePath, setPathToRestoreSession, fetchFiles]);

  useEffect(() => {
    connectFileSharingSseEvent(SseEventType.UploadProgress);
  }, [connectFileSharingSseEvent]);

  useEffect(() => {
    if (fileOperationResult && !isLoading) {
      if (fileOperationResult.success) {
        toast.success(fileOperationResult.message);
        void fetchFiles(currentPath);
      }
    }
  }, [fileOperationResult, isLoading, fetchFiles, currentPath]);

  return { isFileProcessing, isLoading, currentPath, searchParams, setSearchParams, uploadStatus };
};

export default useFileSharingPage;
