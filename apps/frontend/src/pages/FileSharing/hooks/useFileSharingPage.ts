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
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import useFileSharingStore from '@/pages/FileSharing/useFileSharingStore';
import useFileSharingDialogStore from '@/pages/FileSharing/Dialog/useFileSharingDialogStore';
import userStore from '@/store/UserStore/useUserStore';
import usePublicShareStore from '@/pages/FileSharing/publicShare/usePublicShareStore';
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
  const { homePath } = useUserPath();
  const path = searchParams.get('path') || '/';

  useEffect(() => {
    if (user) {
      void fetchMountPoints();
    }
  }, [user]);

  useEffect(() => {
    if (!isFileProcessing) {
      if (path === '/') {
        if (pathToRestoreSession !== '/') {
          setSearchParams(pathToRestoreSession);
        } else {
          void fetchFiles(homePath);
        }
      } else {
        void fetchFiles(path);
        void fetchShares();
        setPathToRestoreSession(path);
      }
    }
  }, [path, pathToRestoreSession, homePath, setPathToRestoreSession, fetchFiles]);

  useEffect(() => {
    const updateFilesAfterSuccess = async () => {
      if (fileOperationResult && !isLoading) {
        if (fileOperationResult.success) {
          await fetchFiles(currentPath);
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
