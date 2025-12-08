/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
 *
 * This software is dual-licensed under the terms of:
 *
 * 1. The GNU Affero General Public License (AGPL-3.0-or-later), as published by the Free Software Foundation.
 *    You may use, modify and distribute this software under the terms of the AGPL, provided that you comply with its conditions.
 *
 *    A copy of the license can be found at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * OR
 *
 * 2. A commercial license agreement with Netzint GmbH. Licensees holding a valid commercial license from Netzint GmbH
 *    may use this software in accordance with the terms contained in such written agreement, without the obligations imposed by the AGPL.
 *
 * If you are uncertain which license applies to your use case, please contact us at info@netzint.de for clarification.
 */

import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { UploadItem } from '@libs/filesharing/types/uploadItem';
import useHandleUploadFileStore from '@/pages/FileSharing/Dialog/upload/useHandleUploadFileStore';
import useFileSharingStore from '@/pages/FileSharing/useFileSharingStore';
import usePublicShareStore from '@/pages/FileSharing/publicShare/usePublicShareStore';
import useUserStore from '@/store/UserStore/useUserStore';
import useReplaceFilesDialogStore from '@/pages/FileSharing/Dialog/useReplaceFilesDialogStore';
import getRandomUUID from '@/utils/getRandomUUID';

const useFileUploadWithReplace = () => {
  const { uploadFiles, updateFilesToUpload } = useHandleUploadFileStore();
  const { files, fetchFiles } = useFileSharingStore();
  const { fetchShares } = usePublicShareStore();
  const { eduApiToken } = useUserStore();
  const { openDialog } = useReplaceFilesDialogStore();
  const { t } = useTranslation();

  const uploadFilesDirectly = useCallback(
    async (filesToUpload: File[], webdavShare: string, currentPath: string) => {
      try {
        updateFilesToUpload(() =>
          filesToUpload.map((file) =>
            Object.assign(new File([file], file.name, { type: file.type }), {
              id: getRandomUUID(),
              isZippedFolder: false,
            } as UploadItem),
          ),
        );

        const results = await uploadFiles(currentPath, eduApiToken, webdavShare);

        if (results && results.length > 0) {
          await fetchFiles(webdavShare, currentPath);
          await fetchShares();
        }
      } catch {
        toast.error(t('filesharingUpload.errors.uploadError'));
      }
    },
    [updateFilesToUpload, uploadFiles, eduApiToken, fetchFiles, fetchShares, t],
  );

  const handleFileUploadWithDuplicateCheck = useCallback(
    async (droppedFiles: File[], webdavShare: string | undefined, currentPath: string) => {
      if (!webdavShare) return;

      const existingFileNames = new Set(files.map((f) => f.filename));

      const duplicateFiles = droppedFiles.filter((file) => existingFileNames.has(file.name));
      const newFiles = droppedFiles.filter((file) => !existingFileNames.has(file.name));

      if (duplicateFiles.length > 0) {
        openDialog({
          files: droppedFiles,
          duplicateFiles,
          newFiles,
          webdavShare,
          currentPath,
        });
      } else {
        await uploadFilesDirectly(droppedFiles, webdavShare, currentPath);
      }
    },
    [files, openDialog, uploadFilesDirectly],
  );

  return { handleFileUploadWithDuplicateCheck, uploadFilesDirectly };
};

export default useFileUploadWithReplace;
