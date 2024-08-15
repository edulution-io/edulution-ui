import { useEffect } from 'react';
import useFileSharingStore from '@/pages/FileSharing/useFileSharingStore';
import { DirectoryFileDTO } from '@libs/filesharing/types/directoryFileDTO';

const useDownloadLinks = (file: DirectoryFileDTO | null) => {
  const { fetchDownloadLinks } = useFileSharingStore();
  useEffect(() => {
    if (file) {
      void fetchDownloadLinks(file);
    }
  }, [file]);
};

export default useDownloadLinks;
