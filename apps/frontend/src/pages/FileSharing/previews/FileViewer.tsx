import React, { useEffect, useState } from 'react';
import ImageComponent from '@/components/ui/ImageComponent';
import { DirectoryFile } from '@libs/filesharing/filesystem';
import useFileSharingStore from '@/pages/FileSharing/FileSharingStore';
import FileContentLoadingIndicator from '@/components/shared/FileContentLoadingIndicator';
import VideoComponent from '@/components/ui/VideoComponent';
import { t } from 'i18next';

interface FileViewerProps {
  file: DirectoryFile;
}

const FileViewer: React.FC<FileViewerProps> = ({ file }) => {
  const { downloadFile } = useFileSharingStore();
  const [downloadLinkURL, setDownloadLinkURL] = useState<string | undefined>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);

  useEffect(() => {
    const fetchDownloadLink = async () => {
      try {
        setIsLoading(true);
        setIsError(false);
        setDownloadLinkURL(undefined);
        const link = await downloadFile(file.filename);
        setDownloadLinkURL(link);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to download file:', error);
        setIsError(true);
        setIsLoading(false);
      }
    };

    void fetchDownloadLink();
  }, [file, downloadFile]);

  const fileExtension = file.filename?.split('.').pop()?.toLowerCase();

  const renderComponent = () => {
    if (isLoading || isError || !downloadLinkURL) {
      return (
        <div className="flex justify-center align-middle">
          <FileContentLoadingIndicator />
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
            downloadLink={downloadLinkURL}
            altText="Image"
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
