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

import React from 'react';
import DirectoryBreadcrumb from '@/pages/FileSharing/breadcrumb/DirectoryBreadcrumb';
import ActionContentDialog from '@/pages/FileSharing/dialog/ActionContentDialog';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import StateLoader from '@/pages/FileSharing/utilities/StateLoader';
import useFileSharingStore from '@/pages/FileSharing/useFileSharingStore';
import useFileSharingPage from '@/pages/FileSharing/hooks/useFileSharingPage';
import FileSharingFloatingButtonsBar from '@/pages/FileSharing/buttonsBar/FileSharingFloatingButtonsBar';
import FileSharingLayout from '@/pages/FileSharing/layout/FileSharingLayout';

const FileSharingPage = () => {
  const { isFileProcessing, currentPath, searchParams, setSearchParams, isLoading } = useFileSharingPage();
  const { files } = useFileSharingStore();
  return (
    <div className="w-full overflow-x-auto">
      <div className="h-[calc(100vh-var(--floating-buttons-height))] flex-1 overflow-hidden">
        <div className="flex w-full flex-col justify-between space-x-2 pb-2 pt-2">
          <DirectoryBreadcrumb
            path={currentPath}
            onNavigate={(filenamePath) => {
              searchParams.set('path', filenamePath);
              setSearchParams(searchParams);
            }}
            style={{ color: 'white' }}
          />
          <StateLoader isLoading={isFileProcessing} />
        </div>
        <LoadingIndicator isOpen={isLoading} />
        <div
          className="max-h[75vh] w-full md:w-auto md:max-w-7xl xl:max-w-full"
          data-testid="test-id-file-sharing-page-data-table"
        >
          <FileSharingLayout files={files} />
        </div>
      </div>
      <div className="fixed bottom-8 mt-10 flex flex-row space-x-24">
        <ActionContentDialog />
        <FileSharingFloatingButtonsBar />
      </div>
    </div>
  );
};

export default FileSharingPage;
