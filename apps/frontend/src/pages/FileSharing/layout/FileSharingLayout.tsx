import React, { useEffect } from 'react';
import FileSharingTable from '@/pages/FileSharing/table/FileSharingTable';
import FileSharingTableColumns from '@/pages/FileSharing/table/FileSharingTableColumns';
import FileViewer from '@/pages/FileSharing/previews/FileViewer';
import { DirectoryFileDTO } from '@libs/filesharing/types/directoryFileDTO';
import useIsMidSizeView from '@/hooks/useIsMidSizeView';
import FilePreviewOptionsBar from '@/pages/FileSharing/buttonsBar/FilePreviewOptionsBar';
import useFileSharingPage from '@/pages/FileSharing/hooks/useFileSharingPage';
import useFileEditorStore from '@/pages/FileSharing/previews/onlyOffice/fileEditorStore';

interface FileSharingLayoutProps {
  currentlyEditingFile: DirectoryFileDTO | null;
  files: DirectoryFileDTO[];
}

const FileSharingLayout: React.FC<FileSharingLayoutProps> = ({ currentlyEditingFile, files }) => {
  const isMidSizeView = useIsMidSizeView();
  const { isFileProcessing } = useFileSharingPage();
  const { setShowEditor, showEditor } = useFileEditorStore();

  useEffect(() => {
    setShowEditor(true);
  }, [currentlyEditingFile]);

  return (
    <div className={`flex ${isMidSizeView ? 'flex-col' : 'w-full flex-row'}`}>
      <div className={`${!showEditor && !isMidSizeView ? 'w-full md:w-1/2 lg:w-2/3' : 'w-full'}`}>
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
          {!isFileProcessing && <FilePreviewOptionsBar />}
          {showEditor && <FileViewer mode="view" />}
        </div>
      )}
    </div>
  );
};

export default FileSharingLayout;
