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

import React, { FC, MutableRefObject, useEffect } from 'react';
import ImageComponent from '@/components/ui/ImageComponent';
import MediaComponent from '@/components/ui/MediaComponent';
import OnlyOffice from '@/pages/FileSharing/FilePreview/OnlyOffice/OnlyOffice';
import { t } from 'i18next';
import isImageExtension from '@libs/filesharing/utils/isImageExtension';
import isMediaExtension from '@libs/filesharing/utils/isMediaExtension';
import useMedia from '@/hooks/useMedia';
import getFileExtension from '@libs/filesharing/utils/getFileExtension';
import isOnlyOfficeDocument from '@libs/filesharing/utils/isOnlyOfficeDocument';
import useFileEditorStore from '@/pages/FileSharing/FilePreview/OnlyOffice/useFileEditorStore';
import useFileSharingStore from '@/pages/FileSharing/useFileSharingStore';
import CircleLoader from '@/components/ui/Loading/CircleLoader';
import useFileSharingDownloadStore from '@/pages/FileSharing/useFileSharingDownloadStore';
import PdfViewer from '@/components/shared/PDFViewer/PdfViewer';

interface FileRendererProps {
  editMode: boolean;
  isOpenedInNewTab?: boolean;
  closingRef?: MutableRefObject<boolean>;
  isOnlyOfficeConfigured?: boolean;
}

const FileRenderer: FC<FileRendererProps> = ({ editMode, isOpenedInNewTab, closingRef, isOnlyOfficeConfigured }) => {
  const { isMobileView } = useMedia();
  const {
    temporaryDownloadUrl: fileUrl,
    publicDownloadLink,
    isEditorLoading,
    isCreatingBlobUrl,
    isFetchingPublicUrl,
    error,
  } = useFileSharingDownloadStore();

  const { currentlyEditingFile } = useFileEditorStore();

  const { setFileIsCurrentlyDisabled } = useFileSharingStore();

  useEffect(() => {
    if (currentlyEditingFile && !isEditorLoading && !isCreatingBlobUrl && !isFetchingPublicUrl) {
      void setFileIsCurrentlyDisabled(currentlyEditingFile.filename, false);
    }
  }, [isEditorLoading, isCreatingBlobUrl, isFetchingPublicUrl, currentlyEditingFile?.filename]);

  useEffect(
    () => () => {
      if (!closingRef?.current && currentlyEditingFile) {
        void setFileIsCurrentlyDisabled(currentlyEditingFile.filename, false);
      }
    },
    [currentlyEditingFile?.filename],
  );

  if (!currentlyEditingFile) return null;

  const fileExtension = getFileExtension(currentlyEditingFile.filePath);
  const isOnlyOfficeDoc = isOnlyOfficeDocument(currentlyEditingFile.filePath);
  if (isOnlyOfficeDoc && isOnlyOfficeConfigured) {
    const isDocReady = !!publicDownloadLink && !!currentlyEditingFile;
    if (isEditorLoading || isCreatingBlobUrl || isFetchingPublicUrl || error || !isDocReady) {
      return (
        <div className="flex h-full items-center justify-center">
          <CircleLoader />
        </div>
      );
    }

    return (
      <OnlyOffice
        url={publicDownloadLink}
        fileName={currentlyEditingFile.filename}
        filePath={currentlyEditingFile.filePath}
        mode={editMode ? 'edit' : 'view'}
        type={isMobileView ? 'mobile' : 'desktop'}
        isOpenedInNewTab={isOpenedInNewTab}
      />
    );
  }

  if (isEditorLoading || isCreatingBlobUrl || isFetchingPublicUrl || error || !fileUrl) {
    return (
      <div className="flex h-full items-center justify-center">
        <CircleLoader />
      </div>
    );
  }

  if (isImageExtension(fileExtension)) {
    return (
      <ImageComponent
        key={fileUrl}
        downloadLink={fileUrl}
        altText="Image"
      />
    );
  }

  if (isMediaExtension(fileExtension)) {
    return (
      <MediaComponent
        key={fileUrl}
        url={fileUrl}
      />
    );
  }

  if (fileExtension === 'pdf') {
    return <PdfViewer fetchUrl={fileUrl} />;
  }

  return <p>{t('filesharing.errors.FileFormatNotSupported')}</p>;
};

export default FileRenderer;
