import React from 'react';
import DirectoryBreadcrumb from '@/pages/FileSharing/breadcrumb/DirectoryBreadcrumb';
import ActionContentDialog from '@/pages/FileSharing/dialog/ActionContentDialog';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import StateLoader from '@/pages/FileSharing/utilities/StateLoader';
import useFileSharingStore from '@/pages/FileSharing/useFileSharingStore';
import useFileSharingPage from '@/pages/FileSharing/hooks/useFileSharingPage';
import FileSharingFloatingButtonsBar from '@/pages/FileSharing/buttonsBar/FileSharingFloatingButtonsBar';
import FileSharingLayout from '@/pages/FileSharing/layout/FileSharingLayout';

const FileSharingPage = () => {
  const { isFileProcessing, currentPath, searchParams, setSearchParams, isLoading } = useFileSharingPage();
  const { files } = useFileSharingStore();
  return (
    <div className="w-full overflow-x-auto">
      {isLoading && <LoadingIndicator isOpen={isLoading} />}
      <div className="h-[calc(100vh-var(--floating-buttons-height))] flex-1 overflow-hidden">
        <div className="flex w-full flex-col justify-between space-x-2 pb-2 pt-2">
          <DirectoryBreadcrumb
            path={currentPath}
            onNavigate={(filenamePath) => {
              searchParams.set('path', filenamePath);
              setSearchParams(searchParams);
            }}
            style={{ color: 'white' }}
          />
          <StateLoader isLoading={isFileProcessing} />
        </div>
        <LoadingIndicator isOpen={isLoading} />
        <div
          className="max-h[75vh] w-full md:w-auto md:max-w-7xl xl:max-w-full"
          data-testid="test-id-file-sharing-page-data-table"
        >
          <FileSharingLayout files={files} />
        </div>
      </div>
      <div className="fixed bottom-8 mt-10 flex flex-row space-x-24 bg-opacity-90">
        <ActionContentDialog />
        <FileSharingFloatingButtonsBar />
      </div>
    </div>
  );
};

export default FileSharingPage;
