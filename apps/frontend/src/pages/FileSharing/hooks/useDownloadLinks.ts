import { useEffect, useState } from 'react';
import useFileSharingStore from '@/pages/FileSharing/FileSharingStore';
import { DirectoryFileDTO } from '@libs/filesharing/types/directoryFileDTO';
import OnlyOfficeDocumentTypes from '@libs/filesharing/types/OnlyOfficeDocumentTypes';

const useDownloadLinks = (file: DirectoryFileDTO) => {
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
          setPublicDownloadLink(publicLink || ' ');
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
