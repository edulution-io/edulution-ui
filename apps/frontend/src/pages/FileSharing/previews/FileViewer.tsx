import React, { FC } from 'react';
import useFileSharingStore from '@/pages/FileSharing/useFileSharingStore';
import FileViewerLayout from '@/pages/FileSharing/previews/utilities/FileViewerLayout';
import FileRenderer from '@/pages/FileSharing/previews/utilities/FileRenderer';
import useDownloadLinks from '@/pages/FileSharing/hooks/useDownloadLinks';
import ResizableWindow from '@/components/framing/ResizableWindow/ResizableWindow';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';

interface FileViewerProps {
  editMode: boolean;
}

const FileViewer: FC<FileViewerProps> = ({ editMode }) => {
  const { t } = useTranslation();
  const { currentlyEditingFile, isFullScreenEditingEnabled, setIsFullScreenEditingEnabled } = useFileSharingStore();
  const { isEditorLoading } = useFileSharingStore();
  const [searchParams] = useSearchParams();
  useDownloadLinks(currentlyEditingFile);

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
          <FileRenderer editMode={editMode} />
        </ResizableWindow>
      ) : (
        <FileRenderer editMode={editMode} />
      )}
    </FileViewerLayout>
  );
};

export default FileViewer;
