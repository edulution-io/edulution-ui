import { useEffect, useState } from 'react';
import { DirectoryFile } from '@libs/filesharing/filesystem';
import useFileSharingStore from '@/pages/FileSharing/FileSharingStore';
import OnlyOfficeDocumentTypes from '@libs/ui/types/filesharing/OnlyOfficeDocumentTypes';

const useDownloadLinks = (file: DirectoryFile) => {
  const { downloadFile, getDownloadLinkURL } = useFileSharingStore();
  const [downloadLinkURL, setDownloadLinkURL] = useState<string | undefined>(undefined);
  const [publicDownloadLink, setPublicDownloadLink] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);

  const isOnlyOfficeDocument = (filePath: string) =>
    Object.values(OnlyOfficeDocumentTypes).some((type) => filePath.includes(type));

  useEffect(() => {
    const fetchDownloadLinks = async () => {
      try {
        setIsLoading(true);
        setIsError(false);
        setDownloadLinkURL(undefined);
        setPublicDownloadLink(null);

        const downloadLink = await downloadFile(file.filename);
        setDownloadLinkURL(downloadLink);

        if (isOnlyOfficeDocument(file.filename)) {
          const publicLink = await getDownloadLinkURL(file.filename, file.basename);
          setPublicDownloadLink(publicLink || '');
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Failed to download file:', error);
        setIsError(true);
        setIsLoading(false);
      }
    };

    void fetchDownloadLinks();
  }, [file, downloadFile, getDownloadLinkURL]);

  return { downloadLinkURL, publicDownloadLink, isLoading, isError };
};

export default useDownloadLinks;
