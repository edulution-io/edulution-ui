import { useEffect } from 'react';

type FileOperationProgress = { percent?: number };

interface Options {
  fileOperationProgress?: FileOperationProgress | null;
  currentPath: string;
  webdavShare?: string;
  fetchFiles: (share: string | undefined, path: string) => Promise<void>;
  fetchShares: () => Promise<void>;
}

const useRefreshOnFileOperationComplete = ({
  fileOperationProgress,
  currentPath,
  webdavShare,
  fetchFiles,
  fetchShares,
}: Options) => {
  useEffect(() => {
    if (!fileOperationProgress) return;
    const percent = fileOperationProgress.percent ?? 0;
    if (percent < 100) return;

    void (async () => {
      await fetchFiles(webdavShare, currentPath);
      await fetchShares();
    })();
  }, [fileOperationProgress, currentPath, webdavShare, fetchFiles, fetchShares]);
};

export default useRefreshOnFileOperationComplete;
