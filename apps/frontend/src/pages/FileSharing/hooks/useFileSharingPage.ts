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

import { useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import useFileSharingStore from '@/pages/FileSharing/useFileSharingStore';
import useFileSharingDialogStore from '@/pages/FileSharing/Dialog/useFileSharingDialogStore';
import usePublicShareStore from '@/pages/FileSharing/publicShare/usePublicShareStore';
import URL_SEARCH_PARAMS from '@libs/common/constants/url-search-params';
import useUserPath from './useUserPath';

const useFileSharingPage = () => {
  const {
    fetchFiles,
    currentPath,
    setPathToRestoreSession,
    pathToRestoreSession,
    isLoading: isFileProcessing,
  } = useFileSharingStore();
  const { isLoading, fileOperationResult } = useFileSharingDialogStore();
  const { fetchShares } = usePublicShareStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const { webdavShare } = useParams();
  const { homePath } = useUserPath();
  const path = searchParams.get(URL_SEARCH_PARAMS.PATH) || homePath;

  useEffect(() => {
    if (!isFileProcessing) {
      if (path === '/') {
        if (pathToRestoreSession !== '/') {
          const newSearchParams = new URLSearchParams(searchParams);
          newSearchParams.set(URL_SEARCH_PARAMS.PATH, pathToRestoreSession);
          setSearchParams(newSearchParams);
        } else {
          void fetchFiles(webdavShare, homePath);
        }
      } else {
        void fetchFiles(webdavShare, path);
        void fetchShares();
        setPathToRestoreSession(path);
      }
    }
  }, [path, pathToRestoreSession, homePath, setPathToRestoreSession, fetchFiles, webdavShare]);

  useEffect(() => {
    const updateFilesAfterSuccess = async () => {
      if (fileOperationResult && !isLoading) {
        if (fileOperationResult.success) {
          await fetchFiles(webdavShare, currentPath);
          await fetchShares();
          toast.success(fileOperationResult.message);
        } else {
          toast.info(fileOperationResult.message);
        }
      }
    };

    void updateFilesAfterSuccess();
  }, [fileOperationResult, isLoading, fetchFiles, currentPath]);

  return { isFileProcessing, isLoading, currentPath, searchParams, setSearchParams };
};

export default useFileSharingPage;
