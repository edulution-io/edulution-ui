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

import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
import DeletePublicShareDialog from '@/pages/FileSharing/publicShare/dialog/DeletePublicShareDialog';
import APPS from '@libs/appconfig/constants/apps';
import FileDropZone from '@/components/ui/FileDropZone';
import useHandelUploadFileStore from '@/pages/FileSharing/Dialog/upload/useHandelUploadFileStore';
import useUserStore from '@/store/UserStore/useUserStore';
import { UploadFile } from '@libs/filesharing/types/uploadFile';
import useVariableSharePathname from './hooks/useVariableSharePathname';

const FileSharingPage = () => {
  const { webdavShare } = useParams();
  const { isFileProcessing, currentPath, searchParams, setSearchParams, isLoading } = useFileSharingPage();
  const { isFilePreviewVisible, isFilePreviewDocked } = useFileEditorStore();
  const { fileOperationProgress, fetchFiles, webdavShares } = useFileSharingStore();
  const { fetchShares } = usePublicShareStore();
  const { uploadFiles, updateFilesToUpload } = useHandelUploadFileStore();
  const { eduApiToken } = useUserStore();
  const navigate = useNavigate();
  const { createVariableSharePathname } = useVariableSharePathname();

  useEffect(() => {
    const handleFileOperationProgress = async () => {
      if (!fileOperationProgress) return;
      const percent = fileOperationProgress.percent ?? 0;
      if (percent >= 100) {
        await fetchFiles(webdavShare, currentPath);
        await fetchShares();
      }
    };

    void handleFileOperationProgress();
  }, [fileOperationProgress]);

  const { percentageUsed } = useQuotaInfo();

  const { share, setShare, closeDialog, dialog } = usePublicShareStore();
  const { origin } = window.location;
  const url = `${origin}/${FileSharingApiEndpoints.PUBLIC_SHARE}/${share?.publicShareId}`;

  const handleClose = () => {
    setShare({} as PublicShareDto);
    closeDialog(PUBLIC_SHARE_DIALOG_NAMES.QR_CODE);
  };

  const getHiddenSegments = () => webdavShares.find((s) => s.displayName === webdavShare)?.pathname;

  const handleBreadcrumbNavigate = (filenamePath: string) => {
    if (filenamePath === '/') {
      const currentShare = webdavShares.find((s) => s.displayName === webdavShare);

      if (!currentShare) return;

      let currentSharePath = currentShare.pathname;
      if (currentShare.pathVariables) {
        currentSharePath = createVariableSharePathname(currentSharePath, currentShare.pathVariables);
      }

      navigate(
        {
          pathname: `/${APPS.FILE_SHARING}/${currentShare.displayName}`,
          search: `?${URL_SEARCH_PARAMS.PATH}=${encodeURIComponent(currentSharePath)}`,
        },
        { replace: true },
      );
    } else {
      const newParams = new URLSearchParams(searchParams);
      newParams.set(URL_SEARCH_PARAMS.PATH, filenamePath);
      setSearchParams(newParams);
    }
  };

  const handleFileUpload = async (files: File[]) => {
    if (!webdavShare) return;

    updateFilesToUpload(() =>
      files.map((file) => {
        const uploadFile: UploadFile = Object.assign(new File([file], file.name, { type: file.type }), {
          id: crypto.randomUUID(),
          isZippedFolder: false,
        });
        return uploadFile;
      }),
    );

    const results = await uploadFiles(currentPath, eduApiToken, webdavShare);

    if (results && results.length > 0) {
      await fetchFiles(webdavShare, currentPath);
      await fetchShares();
    }
  };

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

      <div className="flex h-full w-full flex-row overflow-hidden pb-6">
        <div className={isFilePreviewVisible && isFilePreviewDocked ? 'w-1/2 2xl:w-2/3' : 'w-full'}>
          {isFileProcessing ? <HorizontalLoader className="w-[99%]" /> : <div className="h-1" />}
          <FileDropZone onFileDrop={handleFileUpload}>
            <FileSharingTable />
          </FileDropZone>
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
      <FileSharingFloatingButtonsBar />
    </PageLayout>
  );
};

export default FileSharingPage;
