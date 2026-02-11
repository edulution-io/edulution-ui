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

import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import useFileSharingStore from '@/pages/FileSharing/useFileSharingStore';
import useFileSharingDialogStore from '@/pages/FileSharing/Dialog/useFileSharingDialogStore';
import usePublicShareStore from '@/pages/FileSharing/publicShare/usePublicShareStore';
import URL_SEARCH_PARAMS from '@libs/common/constants/url-search-params';
import useUserPath from './useUserPath';
import useVariableSharePathname from './useVariableSharePathname';

const useFileSharingPage = () => {
  const {
    fetchFiles,
    currentPath,
    setPathToRestoreSession,
    pathToRestoreSession,
    isLoading: isFileProcessing,
    clearFilesOnShareChange,
    webdavShares,
  } = useFileSharingStore();
  const { isLoading, fileOperationResult } = useFileSharingDialogStore();
  const { fetchShares } = usePublicShareStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const { webdavShare } = useParams();
  const { homePath } = useUserPath();
  const { createVariableSharePathname } = useVariableSharePathname();

  const currentShare = useMemo(
    () => webdavShares.find((s) => s.displayName === webdavShare),
    [webdavShares, webdavShare],
  );

  const shareRootPath = useMemo(() => {
    if (currentShare) {
      return createVariableSharePathname(currentShare.pathname, currentShare.pathVariables);
    }
    return homePath;
  }, [currentShare, createVariableSharePathname, homePath]);

  const shareHasPathVariables = currentShare?.pathVariables && currentShare.pathVariables.length > 0;
  const isWaitingForUserData = shareHasPathVariables && shareRootPath === currentShare?.pathname;

  const path = searchParams.get(URL_SEARCH_PARAMS.PATH) || shareRootPath;

  const previousWebdavShare = useRef<string | undefined>(webdavShare);
  const hasRestoredSession = useRef(false);

  const isChildOfShareRoot = useCallback(
    (filePath: string) => {
      const normalizedRoot = shareRootPath.replace(/\/+$/, '');
      return normalizedRoot === '' || filePath === shareRootPath || filePath.startsWith(`${normalizedRoot}/`);
    },
    [shareRootPath],
  );

  useEffect(() => {
    if (previousWebdavShare.current !== webdavShare && previousWebdavShare.current !== undefined) {
      clearFilesOnShareChange();
    }
    previousWebdavShare.current = webdavShare;
  }, [webdavShare, clearFilesOnShareChange]);

  useEffect(() => {
    if (isFileProcessing || webdavShares.length === 0 || isWaitingForUserData) return;

    const hasPathParam = searchParams.has(URL_SEARCH_PARAMS.PATH);

    const redirectTo = (targetPath: string) => {
      const next = new URLSearchParams(searchParams);
      next.set(URL_SEARCH_PARAMS.PATH, targetPath);
      setSearchParams(next, { replace: true });
    };

    if (shareRootPath !== '/' && hasPathParam && !isChildOfShareRoot(path)) {
      redirectTo(shareRootPath);
      return;
    }

    if (!hasRestoredSession.current && pathToRestoreSession !== path && isChildOfShareRoot(pathToRestoreSession)) {
      hasRestoredSession.current = true;
      redirectTo(pathToRestoreSession);
      return;
    }

    hasRestoredSession.current = true;

    if (!hasPathParam && shareRootPath !== '/') {
      redirectTo(shareRootPath);
      return;
    }

    void fetchFiles(webdavShare, path === '/' ? shareRootPath : path);
    void fetchShares();
    if (path !== '/') setPathToRestoreSession(path);
  }, [
    path,
    pathToRestoreSession,
    shareRootPath,
    setPathToRestoreSession,
    fetchFiles,
    webdavShare,
    webdavShares.length,
    isWaitingForUserData,
  ]);

  useEffect(() => {
    if (previousWebdavShare.current !== webdavShare) {
      return;
    }

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
  }, [fileOperationResult, isLoading, fetchFiles, currentPath, webdavShare]);

  return { isFileProcessing, isLoading, currentPath, searchParams, setSearchParams };
};

export default useFileSharingPage;
