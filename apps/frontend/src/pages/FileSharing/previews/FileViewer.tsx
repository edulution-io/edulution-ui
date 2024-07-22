import React from 'react';
import ImageComponent from '@/components/ui/ImageComponent';
import { DirectoryFile } from '@libs/filesharing/filesystem';
import FileContentLoadingIndicator from '@/components/shared/FileContentLoadingIndicator';
import VideoComponent from '@/components/ui/VideoComponent';
import { t } from 'i18next';
import useDownloadLinks from '@/pages/FileSharing/hooks/useDownloadLinks';
import OnlyOffice from '@/pages/FileSharing/previews/onlyOffice/OnlyOffice';

interface FileViewerProps {
  file: DirectoryFile;
}

const FileViewer: React.FC<FileViewerProps> = ({ file }) => {
  const { downloadLinkURL, publicDownloadLink, isLoading, isError } = useDownloadLinks(file);
  const fileExtension = file.filename?.split('.').pop()?.toLowerCase();

  const renderComponent = () => {
    if (isLoading || isError || !downloadLinkURL) {
      return (
        <div className="flex h-full items-center justify-center">
          <FileContentLoadingIndicator />
        </div>
      );
    }

    switch (fileExtension) {
      case 'png':
      case 'jpeg':
      case 'jpg':
        return (
          <ImageComponent
            downloadLink={downloadLinkURL}
            altText="Image"
          />
        );
      case 'pdf':
      case 'xlsx':
      case 'pptx':
      case 'docx':
        return publicDownloadLink ? (
          <OnlyOffice
            url={publicDownloadLink}
            fileName={file.basename}
            filePath={file.filename}
            mode="view"
            type="desktop"
          />
        ) : (
          <FileContentLoadingIndicator />
        );
      case 'gif':
        return (
          <ImageComponent
            downloadLink={downloadLinkURL}
            altText="GIF"
          />
        );
      case 'mp4':
        return <VideoComponent url={downloadLinkURL} />;
      default:
        return <p>{t('loadingIndicator.unsupportedFile')}</p>;
    }
  };

  return <div className="file-viewer">{renderComponent()}</div>;
};

export default FileViewer;
