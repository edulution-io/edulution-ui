import React, { FC, useEffect, useState } from 'react';
import ImageComponent from '@/components/ui/ImageComponent';
import VideoComponent from '@/components/ui/VideoComponent';
import { t } from 'i18next';
import useDownloadLinks from '@/pages/FileSharing/hooks/useDownloadLinks';
import OnlyOffice from '@/pages/FileSharing/previews/onlyOffice/OnlyOffice';
import useFileSharingStore from '@/pages/FileSharing/FileSharingStore';
import useIsMobileView from '@/hooks/useIsMobileView';
import useFileEditorStore from '@/pages/FileSharing/previews/onlyOffice/fileEditorStore';
import FileViewerLayout from '@/pages/FileSharing/previews/FileViewerLayout';

interface FileViewerProps {
  mode: 'view' | 'edit';
}

const FileViewer: FC<FileViewerProps> = ({ mode }) => {
  const { currentlyEditingFile } = useFileSharingStore();
  const { showEditor } = useFileEditorStore();
  if (!currentlyEditingFile) return null;
  const { downloadLinkURL, publicDownloadLink, isLoading, isError } = useDownloadLinks(currentlyEditingFile);
  const fileExtension = currentlyEditingFile.filename?.split('.').pop()?.toLowerCase();
  const isMobile = useIsMobileView();

  const [fileUrl, setFileUrl] = useState<string | null>(null);

  useEffect(() => {
    if (downloadLinkURL) {
      setFileUrl(downloadLinkURL);
    }
  }, [downloadLinkURL]);

  const renderComponent = () => {
    if (isLoading || isError || !fileUrl) {
      return (
        <div className="flex h-full items-center justify-center pt-20">
          <p>{t('preparing')}</p>
        </div>
      );
    }

    switch (fileExtension) {
      case 'png':
      case 'jpeg':
      case 'jpg':
      case 'gif':
        return (
          <ImageComponent
            key={fileUrl}
            downloadLink={fileUrl}
            altText="Image"
          />
        );
      case 'pdf':
      case 'xlsx':
      case 'pptx':
      case 'docx':
        return publicDownloadLink && showEditor ? (
          <OnlyOffice
            url={publicDownloadLink}
            fileName={currentlyEditingFile.basename}
            filePath={currentlyEditingFile.filename}
            mode={mode}
            type={isMobile ? 'mobile' : 'desktop'}
          />
        ) : (
          <p>{t('loadingIndicator.unsupportedFile')}</p>
        );

      case 'mp4':
        return (
          <VideoComponent
            key={fileUrl}
            url={fileUrl}
          />
        );
      default:
        return <p>{t('loadingIndicator.unsupportedFile')}</p>;
    }
  };

  return (
    <FileViewerLayout
      isLoading={isLoading}
      renderComponent={renderComponent}
    />
  );
};

export default FileViewer;
