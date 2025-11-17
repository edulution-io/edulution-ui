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
