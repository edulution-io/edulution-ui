import React, { useEffect } from 'react';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import DirectoryBreadcrumb from '@/pages/FileSharing/DirectoryBreadcrumb';
import FileSharingTable from '@/pages/FileSharing/table/FileSharingTable';
import Columns from '@/pages/FileSharing/table/Columns';
import useFileManagerStore from '@/pages/FileSharing/FileManagerStore';
import FileSharingFloatingButtonsBar from '@/pages/FileSharing/table/FloatingButtonsBar';
import ActionContentDialog from '@/pages/FileSharing/dialog/ActionContentDialog';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import useFileSharingDialogStore from '@/pages/FileSharing/dialog/FileSharingDialogStore';
import useUserStore from '@/store/UserStore/UserStore';

const FileSharingPage = () => {
  const { fetchFiles, files, currentPath, setPathToRestoreSession, pathToRestoreSession } = useFileManagerStore();
  const { isLoading, fileOperationSuccessful } = useFileSharingDialogStore();
  const { username } = useUserStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const path = searchParams.get('path') || '/';
  const homePath = `teachers/${username}`;

  useEffect(() => {
    const fetchAndHandleFiles = async (pathToFetch: string) => {
      try {
        await fetchFiles(pathToFetch);
      } catch (error) {
        console.error('Error fetching files:', error);
      }
    };

    if (path === '/') {
      if (pathToRestoreSession !== '/') {
        setSearchParams(pathToRestoreSession);
      } else {
        fetchAndHandleFiles(homePath).catch((error) => {
          console.error(error);
        });
      }
    } else {
      fetchAndHandleFiles(path).catch((error) => {
        console.error(error);
      });
      setPathToRestoreSession(path);
    }
  }, [path]);

  useEffect(() => {
    const handel = async () => {
      if (fileOperationSuccessful !== undefined && !isLoading) {
        if (fileOperationSuccessful.success) {
          toast.success(fileOperationSuccessful.message);
          await fetchFiles(currentPath);
        } else {
          toast.error(fileOperationSuccessful.message);
        }
      }
    };
    handel().catch((error) => {
      console.error(error);
    });
  }, [fileOperationSuccessful, isLoading]);
  return (
    <div className="w-full overflow-x-auto">
      <div>{isLoading && <LoadingIndicator isOpen={isLoading} />}</div>
      <div className="flex-1 overflow-auto">
        <div className="flex w-full justify-between pb-3 pt-3">
          <div className="flex flex-col ">
            <div className="flex space-x-2">
              <DirectoryBreadcrumb
                path={currentPath}
                onNavigate={(filenamePath) => {
                  searchParams.set('path', filenamePath);
                  setSearchParams(searchParams);
                }}
                style={{ color: 'white' }}
              />
            </div>
          </div>
        </div>
        <div
          className="w-full md:w-auto md:max-w-7xl xl:max-w-full"
          data-testid="test-id-file-sharing-page-data-table"
        >
          <FileSharingTable
            columns={Columns}
            data={files}
          />
        </div>

        <div className="fixed bottom-8 flex flex-row space-x-24 bg-opacity-90">
          <ActionContentDialog />
          <FileSharingFloatingButtonsBar />
        </div>
      </div>
    </div>
  );
};

export default FileSharingPage;
