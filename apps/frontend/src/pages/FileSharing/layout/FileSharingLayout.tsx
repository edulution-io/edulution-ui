import React from 'react';
import { DirectoryFile } from '@libs/filesharing/filesystem';
import FileSharingTable from '@/pages/FileSharing/table/FileSharingTable';
import FileSharingTableColumns from '@/pages/FileSharing/table/FileSharingTableColumns';
import FileViewer from '@/pages/FileSharing/previews/FileViewer';
import useIsMidSizeView from '@/hooks/useIsMidSizeScreen';
import FilePreviewOptionsBar from '@/pages/FileSharing/buttonsBar/FilePreviewOptionsBar';

interface FileSharingLayoutProps {
  currentlyEditingFile: DirectoryFile | null;
  files: DirectoryFile[];
}

const FileSharingLayout: React.FC<FileSharingLayoutProps> = ({ currentlyEditingFile, files }) => {
  const isMidSizeView = useIsMidSizeView();

  return (
    <div className={`flex ${isMidSizeView ? 'flex-col' : 'w-full flex-row'}`}>
      <div
        className={`${currentlyEditingFile && !isMidSizeView ? 'w-full md:w-1/2 lg:w-2/3' : 'w-full'}`}
        data-testid="test-id-file-sharing-page-data-table"
      >
        <FileSharingTable
          columns={FileSharingTableColumns}
          data={files}
        />
      </div>
      {currentlyEditingFile && (
        <div
          className="w-full md:w-1/2 lg:w-1/3"
          data-testid="test-id-file-preview"
        >
          <FilePreviewOptionsBar />
          <FileViewer mode="view" />
        </div>
      )}
    </div>
  );
};

export default FileSharingLayout;
