import React, { FC, useEffect, useState } from 'react';
import useDownloadLinks from '@/pages/FileSharing/hooks/useDownloadLinks';
import useFileSharingStore from '@/pages/FileSharing/FileSharingStore';
import useIsMobileView from '@/hooks/useIsMobileView';
import useFileEditorStore from '@/pages/FileSharing/previews/onlyOffice/fileEditorStore';
import FileViewerLayout from '@/pages/FileSharing/previews/utilities/FileViewerLayout';
import FileRenderer from '@/pages/FileSharing/previews/utilities/FileRenderer';

interface FileViewerProps {
  mode: 'view' | 'edit';
  editWindow: boolean;
}

const FileViewer: FC<FileViewerProps> = ({ mode, editWindow = false }) => {
  const { currentlyEditingFile } = useFileSharingStore();
  const { showEditor } = useFileEditorStore();
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const isMobile = useIsMobileView();

  const { downloadLinkURL, publicDownloadLink, isLoading, isError } = useDownloadLinks(currentlyEditingFile);
  const fileExtension = currentlyEditingFile?.filename?.split('.').pop()?.toLowerCase();

  useEffect(() => {
    if (downloadLinkURL) {
      setFileUrl(downloadLinkURL);
    }
  }, [downloadLinkURL, currentlyEditingFile]);

  return (
    <FileViewerLayout
      isLoading={isLoading}
      editMode={mode === 'edit'}
      renderComponent={() => (
        <FileRenderer
          isLoading={isLoading}
          editWindow={editWindow}
          isError={isError}
          fileUrl={fileUrl}
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
