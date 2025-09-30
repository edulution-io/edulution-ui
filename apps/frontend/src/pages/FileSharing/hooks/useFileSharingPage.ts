/*
 * LICENSE
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import { useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import useFileSharingStore from '@/pages/FileSharing/useFileSharingStore';
import useFileSharingDialogStore from '@/pages/FileSharing/Dialog/useFileSharingDialogStore';
import userStore from '@/store/UserStore/useUserStore';
import usePublicShareStore from '@/pages/FileSharing/publicShare/usePublicShareStore';
import URL_SEARCH_PARAMS from '@libs/common/constants/url-search-params';
import useUserPath from './useUserPath';

const useFileSharingPage = () => {
  const {
    fetchMountPoints,
    fetchFiles,
    currentPath,
    setPathToRestoreSession,
    pathToRestoreSession,
    isLoading: isFileProcessing,
  } = useFileSharingStore();
  const { isLoading, fileOperationResult } = useFileSharingDialogStore();
  const { fetchShares } = usePublicShareStore();
  const { user } = userStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const { webdavShare } = useParams();
  const { homePath } = useUserPath();
  const path = searchParams.get(URL_SEARCH_PARAMS.PATH) || homePath;

  useEffect(() => {
    if (user) {
      void fetchMountPoints(webdavShare);
    }
  }, [user, webdavShare]);

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
