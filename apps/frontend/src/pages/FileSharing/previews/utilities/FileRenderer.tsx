import React, { FC } from 'react';
import ImageComponent from '@/components/ui/ImageComponent';
import VideoComponent from '@/components/ui/VideoComponent';
import OnlyOffice from '@/pages/FileSharing/previews/onlyOffice/OnlyOffice';
import FileContentLoadingIndicator from '@/components/shared/FileContentLoadingIndicator';
import { t } from 'i18next';
import isImageExtension from '@libs/filesharing/utils/isImageExtension';
import isVideoExtension from '@libs/filesharing/utils/isVideoExtension';
import useFileEditorStore from '@/pages/FileSharing/previews/onlyOffice/useFileEditorStore';
import useIsMobileView from '@/hooks/useIsMobileView';
import useFileSharingStore from '@/pages/FileSharing/useFileSharingStore';
import getFileExtension from '@libs/filesharing/utils/getFileExtension';
import isOnlyOfficeDocument from '@libs/filesharing/utils/isOnlyOfficeDocument';

interface FileRendererProps {
  editMode: boolean;
}

const FileRenderer: FC<FileRendererProps> = ({ editMode }) => {
  const isMobileView = useIsMobileView();
  const { showEditor } = useFileEditorStore();
  const { downloadLinkURL: fileUrl, publicDownloadLink, isEditorLoading, isError } = useFileSharingStore();
  const { currentlyEditingFile } = useFileSharingStore();

  if (!currentlyEditingFile) return null;
  const fileExtension = getFileExtension(currentlyEditingFile.filename);

  if (isEditorLoading || isError || !fileUrl) {
    return (
      <div className="bg-global flex h-full items-center justify-center py-20">
        <p>{t('preparing')}</p>
      </div>
    );
  }

  if (isImageExtension(fileExtension)) {
    return (
      <ImageComponent
        key={fileUrl}
        downloadLink={fileUrl}
        altText="Image"
      />
    );
  }

  const isDocumentReady = publicDownloadLink && currentlyEditingFile && (showEditor || editMode);
  if (isOnlyOfficeDocument(currentlyEditingFile.filename)) {
    return isDocumentReady ? (
      <OnlyOffice
        url={publicDownloadLink}
        fileName={currentlyEditingFile.basename}
        filePath={currentlyEditingFile.filename}
        mode={editMode ? 'edit' : 'view'}
        type={isMobileView ? 'mobile' : 'desktop'}
      />
    ) : (
      <FileContentLoadingIndicator />
    );
  }

  if (isVideoExtension(fileExtension)) {
    return (
      <VideoComponent
        key={fileUrl}
        url={fileUrl}
      />
    );
  }
  return <p>{t('loadingIndicator.unsupportedFile')}</p>;
};

export default FileRenderer;
