import React, { FC } from 'react';
import useFileSharingStore from '@/pages/FileSharing/useFileSharingStore';
import useIsMobileView from '@/hooks/useIsMobileView';
import useFileEditorStore from '@/pages/FileSharing/previews/onlyOffice/useFileEditorStore';
import FileViewerLayout from '@/pages/FileSharing/previews/utilities/FileViewerLayout';
import FileRenderer from '@/pages/FileSharing/previews/utilities/FileRenderer';
import getFileExtension from '@libs/filesharing/utils/getFileExtension';
import useDownloadLinks from '@/pages/FileSharing/hooks/useDownloadLinks';

interface FileViewerProps {
  mode: 'view' | 'edit';
  editWindow: boolean;
}

const FileViewer: FC<FileViewerProps> = ({ mode, editWindow = false }) => {
  const { currentlyEditingFile } = useFileSharingStore();
  const { downloadLinkURL, publicDownloadLink, isEditorLoading, isError } = useFileSharingStore();
  const { showEditor } = useFileEditorStore();
  const isMobile = useIsMobileView();
  useDownloadLinks(currentlyEditingFile);
  if (!currentlyEditingFile) return null;
  const fileExtension = getFileExtension(currentlyEditingFile?.filename);

  return (
    <FileViewerLayout
      isLoading={isEditorLoading}
      editMode={mode === 'edit'}
      renderComponent={() => (
        <FileRenderer
          isLoading={isEditorLoading}
          editWindow={editWindow}
          isError={isError}
          fileUrl={downloadLinkURL}
          fileExtension={fileExtension}
          publicDownloadLink={publicDownloadLink}
          showEditor={showEditor}
          mode={mode}
          isMobile={isMobile}
          currentlyEditingFile={currentlyEditingFile}
        />
      )}
    />
  );
};

export default FileViewer;
