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

import React, { FC } from 'react';
import ImageComponent from '@/components/ui/ImageComponent';
import VideoComponent from '@/components/ui/VideoComponent';
import OnlyOffice from '@/pages/FileSharing/FilePreview/OnlyOffice/OnlyOffice';
import { t } from 'i18next';
import isImageExtension from '@libs/filesharing/utils/isImageExtension';
import isVideoExtension from '@libs/filesharing/utils/isVideoExtension';
import useIsMobileView from '@/hooks/useIsMobileView';
import getFileExtension from '@libs/filesharing/utils/getFileExtension';
import isOnlyOfficeDocument from '@libs/filesharing/utils/isOnlyOfficeDocument';
import useFileEditorStore from '@/pages/FileSharing/FilePreview/OnlyOffice/useFileEditorStore';
import CircleLoader from '@/components/ui/Loading/CircleLoader';

interface FileRendererProps {
  editMode: boolean;
}

const FileRenderer: FC<FileRendererProps> = ({ editMode }) => {
  const isMobileView = useIsMobileView();
  const {
    downloadLinkURL: fileUrl,
    publicDownloadLink,
    currentlyEditingFile,
    isEditorLoading,
    error,
  } = useFileEditorStore();

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
      />
    ) : (
      <div className="flex flex-col items-center justify-center space-y-4">
        <CircleLoader />
      </div>
    );
  }

  if (isVideoExtension(fileExtension)) {
    return (
      <VideoComponent
        key={fileUrl}
        url={fileUrl}
      />
    );
  }
  return <p>{t('loadingIndicator.unsupportedFile')}</p>;
};

export default FileRenderer;
