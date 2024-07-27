import React from 'react';
import DirectoryBreadcrumb from '@/pages/FileSharing/breadcrumb/DirectoryBreadcrumb';
import FileSharingTable from '@/pages/FileSharing/table/FileSharingTable';
import FileSharingTableColumns from '@/pages/FileSharing/table/FileSharingTableColumns';
import ActionContentDialog from '@/pages/FileSharing/dialog/ActionContentDialog';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import StateLoader from '@/pages/FileSharing/utilities/StateLoader';
import useFileSharingStore from '@/pages/FileSharing/FileSharingStore';
import useFileSharingPage from '@/pages/FileSharing/hooks/useFileSharingPage';
import FileSharingFloatingButtonsBar from '@/pages/FileSharing/buttonsBar/FloatingButtonsBar';

const FileSharingPage = () => {
  const { isFileProcessing, currentPath, searchParams, setSearchParams, isLoading } = useFileSharingPage();
  const { files } = useFileSharingStore();
  return (
    <div className="w-full overflow-x-auto">
      <div className="h-[calc(100vh-var(--floating-buttons-height))] flex-1 overflow-hidden">
        <div className="flex w-full flex-row justify-between space-x-2 pb-2 pt-2">
          <DirectoryBreadcrumb
            path={currentPath}
            onNavigate={(filenamePath) => {
              searchParams.set('path', filenamePath);
              setSearchParams(searchParams);
            }}
            style={{ color: 'white' }}
          />
          <div className="flex items-center justify-end pr-10">
            <StateLoader isFileProcessing={isFileProcessing} />
            <p /> {/* Do not remove - this will prevent the table scrollbar from being reloaded. */}
          </div>
        </div>
        <LoadingIndicator isOpen={isLoading} />
        <div
          className="w-full md:w-auto md:max-w-7xl xl:max-w-full"
          data-testid="test-id-file-sharing-page-data-table"
        >
          <FileSharingTable
            columns={FileSharingTableColumns}
            data={files}
          />
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
