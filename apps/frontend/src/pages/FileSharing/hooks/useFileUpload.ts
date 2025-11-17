import useHandelUploadFileStore from '@/pages/FileSharing/Dialog/upload/useHandelUploadFileStore';
import { useTranslation } from 'react-i18next';
import { useCallback } from 'react';
import { UploadFile } from '@libs/filesharing/types/uploadFile';
import useUserStore from '@/store/UserStore/useUserStore';
import { toast } from 'sonner';
import useFileSharingStore from '../useFileSharingStore';
import usePublicShareStore from '../publicShare/usePublicShareStore';

const useFileUpload = () => {
  const { uploadFiles, updateFilesToUpload } = useHandelUploadFileStore();
  const { fetchFiles } = useFileSharingStore();
  const { fetchShares } = usePublicShareStore();
  const { eduApiToken } = useUserStore();
  const { t } = useTranslation();

  const handleFileUpload = useCallback(
    async (files: File[], webdavShare: string | undefined, currentPath: string) => {
      if (!webdavShare) return;

      try {
        updateFilesToUpload(() =>
          files.map((file) =>
            Object.assign(new File([file], file.name, { type: file.type }), {
              id: crypto.randomUUID(),
              isZippedFolder: false,
            } as UploadFile),
          ),
        );

        const results = await uploadFiles(currentPath, eduApiToken, webdavShare);

        if (results && results.length > 0) {
          await fetchFiles(webdavShare, currentPath);
          await fetchShares();
        }
      } catch {
        toast.error(t('filesharingUpload.error.uploadError'));
      }
    },
    [updateFilesToUpload, uploadFiles, eduApiToken, fetchFiles, fetchShares, t],
  );

  return { handleFileUpload };
};

export default useFileUpload;
