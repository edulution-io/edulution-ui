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

interface FileRendererProps {
  editMode: boolean;
  isOpenedInNewTab?: boolean;
  closingRef?: MutableRefObject<boolean>;
}

const FileRenderer: FC<FileRendererProps> = ({ editMode, isOpenedInNewTab, closingRef }) => {
  const { isMobileView } = useMedia();
  const {
    downloadLinkURL: fileUrl,
    publicDownloadLink,
    isEditorLoading,
    isDownloadFileLoading,
    isFetchDownloadLinkLoading,
    error,
  } = useFileSharingDownloadStore();

  const { currentlyEditingFile } = useFileEditorStore();
  const { setFileIsCurrentlyDisabled } = useFileSharingStore();

  useEffect(() => {
    if (currentlyEditingFile && !isEditorLoading && !isDownloadFileLoading && !isFetchDownloadLinkLoading) {
      void setFileIsCurrentlyDisabled(currentlyEditingFile.basename, false);
    }
  }, [isEditorLoading, isDownloadFileLoading, isFetchDownloadLinkLoading, currentlyEditingFile?.basename]);

  useEffect(
    () => () => {
      if (!closingRef?.current && currentlyEditingFile) {
        void setFileIsCurrentlyDisabled(currentlyEditingFile.basename, false);
      }
    },
    [currentlyEditingFile?.basename],
  );

  if (!currentlyEditingFile) return null;
  const fileExtension = getFileExtension(currentlyEditingFile.filename);

  if (isEditorLoading || error || !fileUrl) {
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

  const isDocumentReady = publicDownloadLink && currentlyEditingFile;
  if (isOnlyOfficeDocument(currentlyEditingFile.filename)) {
    return isDocumentReady ? (
      <OnlyOffice
        url={publicDownloadLink}
        fileName={currentlyEditingFile.basename}
        filePath={currentlyEditingFile.filename}
        mode={editMode ? 'edit' : 'view'}
        type={isMobileView ? 'mobile' : 'desktop'}
        isOpenedInNewTab={isOpenedInNewTab}
      />
    ) : (
      <div className="flex flex-col items-center justify-center space-y-4">
        <CircleLoader />
      </div>
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
  return <p>{t('loadingIndicator.unsupportedFile')}</p>;
};

export default FileRenderer;
