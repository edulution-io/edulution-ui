import React, { useEffect } from 'react';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import DirectoryBreadcrumb from '@/pages/FileSharing/breadcrumb/DirectoryBreadcrumb';
import useFileSharingStore from '@/pages/FileSharing/FileSharingStore';
import FileSharingFloatingButtonsBar from '@/pages/FileSharing/buttonsBar/FloatingButtonsBar';
import ActionContentDialog from '@/pages/FileSharing/dialog/ActionContentDialog';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import useFileSharingDialogStore from '@/pages/FileSharing/dialog/FileSharingDialogStore';
import userStore from '@/store/UserStore/UserStore';
import FileSharingLayout from '@/pages/FileSharing/layout/FileSharingLayout';

const FileSharingPage = () => {
  const { fetchFiles, files, currentPath, setPathToRestoreSession, pathToRestoreSession, currentlyEditingFile } =
    useFileSharingStore();
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
  }, [path]);

  useEffect(() => {
    if (fileOperationResult !== undefined && !isLoading) {
      if (fileOperationResult.success) {
        toast.success(fileOperationResult.message);
        void fetchFiles(currentPath);
      }
    }
  }, [fileOperationResult, isLoading]);

  return (
    <div className="w-full overflow-x-auto">
      {isLoading && <LoadingIndicator isOpen={isLoading} />}
      <div className="flex-1 overflow-auto">
        <div className="flex w-full flex-col  justify-between space-x-2 pb-3 pt-3">
          <DirectoryBreadcrumb
            path={currentPath}
            onNavigate={(filenamePath) => {
              searchParams.set('path', filenamePath);
              setSearchParams(searchParams);
            }}
            style={{ color: 'white' }}
          />
        </div>

        <FileSharingLayout
          currentlyEditingFile={currentlyEditingFile}
          files={files}
        />

        <div className="fixed bottom-8 flex flex-row space-x-24 bg-opacity-90">
          <ActionContentDialog />
          <FileSharingFloatingButtonsBar />
        </div>
      </div>
    </div>
  );
};

export default FileSharingPage;