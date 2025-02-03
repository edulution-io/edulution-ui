import React, { FC, useEffect } from 'react';
import useFileSharingStore from '@/pages/FileSharing/useFileSharingStore';
import FileViewerLayout from '@/pages/FileSharing/previews/utilities/FileViewerLayout';
import FileRenderer from '@/pages/FileSharing/previews/utilities/FileRenderer';
import ResizableWindow from '@/components/framing/ResizableWindow/ResizableWindow';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';

interface FileViewerProps {
  editMode: boolean;
}

const FileViewer: FC<FileViewerProps> = ({ editMode }) => {
  const { t } = useTranslation();
  const { currentlyEditingFile, isFullScreenEditingEnabled, setIsFullScreenEditingEnabled, fetchDownloadLinks } =
    useFileSharingStore();
  const { isEditorLoading } = useFileSharingStore();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (currentlyEditingFile) {
      void fetchDownloadLinks(currentlyEditingFile);
    }
  }, [currentlyEditingFile, isFullScreenEditingEnabled]);

  const isOpenedInNewTab = Boolean(searchParams.get('tab'));

  return (
    <FileViewerLayout
      isLoading={isEditorLoading}
      editMode={isOpenedInNewTab}
    >
      {isFullScreenEditingEnabled && !isOpenedInNewTab ? (
        <ResizableWindow
          disableMinimizeWindow
          disableToggleMaximizeWindow
          titleTranslationId={t('filesharing.fileEditor')}
          handleClose={() => setIsFullScreenEditingEnabled(false)}
        >
          <FileRenderer editMode />
        </ResizableWindow>
      ) : (
        <FileRenderer editMode={editMode} />
      )}
    </FileViewerLayout>
  );
};

export default FileViewer;
