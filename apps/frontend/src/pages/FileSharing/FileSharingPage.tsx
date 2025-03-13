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
import DirectoryBreadcrumb from '@/pages/FileSharing/Table/DirectoryBreadcrumb';
import ActionContentDialog from '@/pages/FileSharing/Dialog/ActionContentDialog';
import LoadingIndicatorDialog from '@/components/ui/Loading/LoadingIndicatorDialog';
import useFileSharingPage from '@/pages/FileSharing/hooks/useFileSharingPage';
import FileSharingFloatingButtonsBar from '@/pages/FileSharing/FloatingButtonsBar/FileSharingFloatingButtonsBar';
import FileSharingTable from '@/pages/FileSharing/Table/FileSharingTable';
import FileViewer from '@/pages/FileSharing/FilePreview/FileViewer';
import useIsMobileView from '@/hooks/useIsMobileView';
import useAppConfigsStore from '@/pages/Settings/AppConfig/appConfigsStore';
import getExtendedOptionsValue from '@libs/appconfig/utils/getExtendedOptionsValue';
import APPS from '@libs/appconfig/constants/apps';
import ExtendedOptionKeys from '@libs/appconfig/constants/extendedOptionKeys';
import ContentType from '@libs/filesharing/types/contentType';
import isFileValid from '@libs/filesharing/utils/isFileValid';
import useFileEditorStore from '@/pages/FileSharing/FilePreview/OnlyOffice/useFileEditorStore';
import FILE_PREVIEW_ELEMENT_ID from '@libs/filesharing/constants/filePreviewElementId';
import HorizontalLoader from '@/components/ui/Loading/HorizontalLoader';
import useFileSharingStore from '@/pages/FileSharing/useFileSharingStore';
import ProgressToaster from '@/components/ui/ProgressToaster';

const FileSharingPage = () => {
  const isMobileView = useIsMobileView();
  const { isFileProcessing, currentPath, searchParams, setSearchParams, isLoading } = useFileSharingPage();
  const { currentlyEditingFile } = useFileEditorStore();
  const { appConfigs } = useAppConfigsStore();
  const { downloadProgress } = useFileSharingStore();
  const isDocumentServerConfigured = !!getExtendedOptionsValue(
    appConfigs,
    APPS.FILE_SHARING,
    ExtendedOptionKeys.ONLY_OFFICE_URL,
  );
  const isValidFile = currentlyEditingFile?.type === ContentType.FILE && isFileValid(currentlyEditingFile);
  const isFilePreviewVisible = isValidFile && isDocumentServerConfigured && !isMobileView;

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
        </div>
        <LoadingIndicatorDialog isOpen={isLoading} />
        <div
          className="flex h-full w-full flex-row md:w-auto md:max-w-7xl xl:max-w-full"
          data-testid="test-id-file-sharing-page-data-table"
        >
          <div className={isFilePreviewVisible ? 'w-1/2 2xl:w-2/3' : 'w-full'}>
            {isFileProcessing ? <HorizontalLoader className="w-[99%]" /> : <div className="h-1" />}
            <FileSharingTable />
          </div>
          {isFilePreviewVisible && (
            <div
              id={FILE_PREVIEW_ELEMENT_ID}
              className="h-full w-1/2 2xl:w-1/3"
              data-testid="test-id-file-preview"
            >
              <FileViewer />
            </div>
          )}
        </div>
      </div>

      <p>{JSON.stringify(downloadProgress)}</p>
      {downloadProgress > 0 && <ProgressToaster data={{ percent: downloadProgress, id: 'g' }} />}
      <div className="fixed bottom-8 mt-10 flex flex-row space-x-24">
        <ActionContentDialog />
        <FileSharingFloatingButtonsBar />
      </div>
    </div>
  );
};

export default FileSharingPage;
