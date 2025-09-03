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
import useUserStore from '@/store/UserStore/useUserStore';

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

  const { user } = useUserStore();

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

  if (currentlyEditingFile.filename.endsWith('.pdf')) {
    const username = user?.username;
    const password = user?.password;
    const token = btoa(`${username}:${password}`);

    return (
      <PdfViewer
        fetchUrl={fileUrl}
        fetchOptions={{
          credentials: 'include',
          headers: {
            Authorization: `Basic ${token}`,
          },
        }}
      />
    );
  }

  return <p>{t('loadingIndicator.unsupportedFile')}</p>;
};

export default FileRenderer;
