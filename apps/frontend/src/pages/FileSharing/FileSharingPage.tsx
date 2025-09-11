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

import React, { useEffect } from 'react';
import DirectoryBreadcrumb from '@/pages/FileSharing/Table/DirectoryBreadcrumb';
import ActionContentDialog from '@/pages/FileSharing/Dialog/ActionContentDialog';
import LoadingIndicatorDialog from '@/components/ui/Loading/LoadingIndicatorDialog';
import useFileSharingPage from '@/pages/FileSharing/hooks/useFileSharingPage';
import FileSharingFloatingButtonsBar from '@/pages/FileSharing/FloatingButtonsBar/FileSharingFloatingButtonsBar';
import FileSharingTable from '@/pages/FileSharing/Table/FileSharingTable';
import useFileEditorStore from '@/pages/FileSharing/FilePreview/OnlyOffice/useFileEditorStore';
import HorizontalLoader from '@/components/ui/Loading/HorizontalLoader';
import FILE_PREVIEW_ELEMENT_ID from '@libs/filesharing/constants/filePreviewElementId';
import useFileSharingStore from '@/pages/FileSharing/useFileSharingStore';
import PageLayout from '@/components/structure/layout/PageLayout';
import QuotaLimitInfo from '@/pages/FileSharing/utilities/QuotaLimitInfo';
import useQuotaInfo from '@/hooks/useQuotaInfo';
import DownloadPublicShareDialog from '@/pages/FileSharing/publicShare/dialog/DownloadPublicShareDialog';
import usePublicShareStore from '@/pages/FileSharing/publicShare/usePublicShareStore';
import CreateOrEditPublicShareDialog from '@/pages/FileSharing/publicShare/dialog/CreateOrEditPublicShareDialog';
import FileSharingApiEndpoints from '@libs/filesharing/types/fileSharingApiEndpoints';
import PublicShareDto from '@libs/filesharing/types/publicShareDto';
import SharePublicQRDialog from '@/components/shared/SharePublicQRDialog';
import PUBLIC_SHARE_DIALOG_NAMES from '@libs/filesharing/constants/publicShareDialogNames';
import URL_SEARCH_PARAMS from '@libs/common/constants/url-search-params';
import UploadFileDialog from '@/pages/FileSharing/Dialog/UploadFileDialog';
import useUploadProgressToast from '@/hooks/useUploadProgressToast';

const FileSharingPage = () => {
  const { isFileProcessing, currentPath, searchParams, setSearchParams, isLoading } = useFileSharingPage();
  const { isFilePreviewVisible, isFilePreviewDocked } = useFileEditorStore();
  const { fileOperationProgress, fetchFiles } = useFileSharingStore();
  const { fetchShares } = usePublicShareStore();

  useUploadProgressToast();

  useEffect(() => {
    const handleFileOperationProgress = async () => {
      if (!fileOperationProgress) return;
      const percent = fileOperationProgress.percent ?? 0;
      if (percent >= 100) {
        await fetchFiles(currentPath);
        await fetchShares();
      }
    };

    void handleFileOperationProgress();
  }, [fileOperationProgress]);
  const { percentageUsed } = useQuotaInfo();

  useEffect(() => {
    void fetchShares();
  }, [currentPath, fetchFiles, fetchShares]);

  const { share, setShare, closeDialog, dialog } = usePublicShareStore();
  const { origin } = window.location;
  const url = `${origin}/${FileSharingApiEndpoints.PUBLIC_SHARE}/${share?.publicShareId}`;

  const handleClose = () => {
    setShare({} as PublicShareDto);
    closeDialog(PUBLIC_SHARE_DIALOG_NAMES.QR_CODE);
  };

  return (
    <PageLayout>
      <LoadingIndicatorDialog isOpen={isLoading} />

      <div className="flex w-full flex-row justify-between space-x-2 pb-2 pt-2">
        <DirectoryBreadcrumb
          path={currentPath}
          onNavigate={(filenamePath) => {
            const newParams = new URLSearchParams(searchParams);
            newParams.set(URL_SEARCH_PARAMS.PATH, filenamePath);
            setSearchParams(newParams);
          }}
          style={{ color: 'white' }}
        />
        <QuotaLimitInfo percentageUsed={percentageUsed} />
      </div>

      <div className="flex h-full w-full flex-row overflow-hidden pb-6">
        <div className={isFilePreviewVisible && isFilePreviewDocked ? 'w-1/2 2xl:w-2/3' : 'w-full'}>
          {isFileProcessing ? <HorizontalLoader className="w-[99%]" /> : <div className="h-1" />}

          <FileSharingTable />
        </div>

        {isFilePreviewVisible && (
          <div
            id={FILE_PREVIEW_ELEMENT_ID}
            className={isFilePreviewDocked ? 'h-full w-1/2 2xl:w-1/3' : ''}
          />
        )}
      </div>

      <ActionContentDialog />
      <DownloadPublicShareDialog />
      <SharePublicQRDialog
        isOpen={dialog.qrCode}
        handleClose={handleClose}
        url={url}
        titleTranslationId="filesharing.publicFileSharing.qrCodePublicShareFile"
        descriptionTranslationId=""
      />
      <CreateOrEditPublicShareDialog />
      <UploadFileDialog />
      <FileSharingFloatingButtonsBar />
    </PageLayout>
  );
};

export default FileSharingPage;
