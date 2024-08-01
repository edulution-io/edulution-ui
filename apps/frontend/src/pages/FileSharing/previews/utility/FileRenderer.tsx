import React, { FC } from 'react';
import ImageComponent from '@/components/ui/ImageComponent';
import VideoComponent from '@/components/ui/VideoComponent';
import OnlyOffice from '@/pages/FileSharing/previews/onlyOffice/OnlyOffice';
import FileContentLoadingIndicator from '@/components/shared/FileContentLoadingIndicator';
import { t } from 'i18next';
import { DirectoryFileDTO } from '@libs/filesharing/types/directoryFileDTO';
import isImageExtension from '@libs/filesharing/utils/isImageExtension';
import isDocumentExtension from '@libs/filesharing/utils/isDocumentExtension';
import isVideoExtension from '@libs/filesharing/utils/isVideoExtension';

interface FileRendererProps {
  isLoading: boolean;
  isError: boolean;
  fileUrl: string | null;
  fileExtension: string | undefined;
  publicDownloadLink: string | null;
  showEditor: boolean;
  mode: 'view' | 'edit';
  isMobile: boolean;
  editWindow: boolean;
  currentlyEditingFile: DirectoryFileDTO;
}

const FileRenderer: FC<FileRendererProps> = ({
  isLoading,
  isError,
  fileUrl,
  fileExtension,
  publicDownloadLink,
  showEditor,
  mode,
  isMobile,
  currentlyEditingFile,
  editWindow,
}) => {
  if (isLoading || isError || !fileUrl) {
    return (
      <div className="flex h-full items-center justify-center pt-20">
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

  if (isDocumentExtension(fileExtension)) {
    return publicDownloadLink && (showEditor || editWindow) ? (
      <OnlyOffice
        url={publicDownloadLink}
        fileName={currentlyEditingFile.basename}
        filePath={currentlyEditingFile.filename}
        mode={mode}
        type={isMobile ? 'mobile' : 'desktop'}
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
