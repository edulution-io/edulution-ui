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

import React from 'react';
import { useParams } from 'react-router-dom';
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
import SharePublicQRDialog from '@/components/shared/SharePublicQRDialog';
import UploadFileDialog from '@/pages/FileSharing/Dialog/UploadFileDialog';
import DeletePublicShareDialog from '@/pages/FileSharing/publicShare/dialog/DeletePublicShareDialog';
import FileDropZone from '@/components/ui/FileDropZone';
import usePublicShareQr from '@/pages/FileSharing/hooks/usePublicShareQr';
import ReplaceFilesDialog from '@/pages/FileSharing/Dialog/ReplaceFilesDialog';
import useBreadcrumbNavigation from '@/pages/FileSharing/hooks/useBreadcrumbNavigation';
import useFileUploadWithReplace from '@/pages/FileSharing/hooks/useFileUploadWithReplace';
import useRefreshOnFileOperationComplete from './hooks/useRefreshOnFileOperationComplete';

const FileSharingPage = () => {
  const { webdavShare } = useParams();
  const { isFileProcessing, currentPath, searchParams, setSearchParams, isLoading } = useFileSharingPage();
  const { isFilePreviewVisible, isFilePreviewDocked } = useFileEditorStore();
  const { fileOperationProgress, fetchFiles, webdavShares } = useFileSharingStore();
  const { fetchShares } = usePublicShareStore();

  useRefreshOnFileOperationComplete({
    fileOperationProgress,
    currentPath,
    webdavShare,
    fetchFiles,
    fetchShares,
  });

  const { percentageUsed } = useQuotaInfo();

  const { dialog, url, handleClose } = usePublicShareQr();

  const getHiddenSegments = () => webdavShares.find((s) => s.displayName === webdavShare)?.pathname;

  const { handleBreadcrumbNavigate } = useBreadcrumbNavigation(
    webdavShare,
    webdavShares,
    searchParams,
    setSearchParams,
  );

  const { handleFileUploadWithDuplicateCheck } = useFileUploadWithReplace();

  return (
    <PageLayout>
      <LoadingIndicatorDialog isOpen={isLoading} />

      <div className="flex w-full flex-row justify-between space-x-2 pb-2 pt-2">
        <DirectoryBreadcrumb
          path={currentPath}
          onNavigate={handleBreadcrumbNavigate}
          style={{ color: 'white' }}
          hiddenSegments={getHiddenSegments()}
        />
        <QuotaLimitInfo percentageUsed={percentageUsed} />
      </div>

      <div className="flex h-full w-full flex-row overflow-hidden">
        <div className={`flex flex-col ${isFilePreviewVisible && isFilePreviewDocked ? 'w-1/2 2xl:w-2/3' : 'w-full'}`}>
          {isFileProcessing ? <HorizontalLoader className="w-[99%]" /> : <div className="h-1" />}
          <div className="flex-1 overflow-hidden pb-6">
            <FileDropZone onFileDrop={(files) => handleFileUploadWithDuplicateCheck(files, webdavShare, currentPath)}>
              <FileSharingTable />
            </FileDropZone>
          </div>
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
      <DeletePublicShareDialog />
      <UploadFileDialog />
      <ReplaceFilesDialog />
      <FileSharingFloatingButtonsBar />
    </PageLayout>
  );
};

export default FileSharingPage;
