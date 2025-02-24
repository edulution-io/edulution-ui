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
import OnlyOffice from '@/pages/FileSharing/previews/onlyOffice/OnlyOffice';
import FileContentLoadingIndicator from '@/components/shared/FileContentLoadingIndicator';
import { t } from 'i18next';
import isImageExtension from '@libs/filesharing/utils/isImageExtension';
import isVideoExtension from '@libs/filesharing/utils/isVideoExtension';
import useFileEditorStore from '@/pages/FileSharing/previews/onlyOffice/useFileEditorStore';
import useIsMobileView from '@/hooks/useIsMobileView';
import useFileSharingStore from '@/pages/FileSharing/useFileSharingStore';
import getFileExtension from '@libs/filesharing/utils/getFileExtension';
import isOnlyOfficeDocument from '@libs/filesharing/utils/isOnlyOfficeDocument';

interface FileRendererProps {
  editMode: boolean;
}

const FileRenderer: FC<FileRendererProps> = ({ editMode }) => {
  const isMobileView = useIsMobileView();
  const { showEditor } = useFileEditorStore();
  const { downloadLinkURL: fileUrl, publicDownloadLink, isEditorLoading, isError } = useFileSharingStore();
  const { currentlyEditingFile } = useFileSharingStore();

  if (!currentlyEditingFile) return null;
  const fileExtension = getFileExtension(currentlyEditingFile.filename);

  if (isEditorLoading || isError || !fileUrl) {
    return (
      <div className="bg-global flex h-full items-center justify-center py-20">
        <p>{t('preparing')}</p>
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

  const isDocumentReady = publicDownloadLink && currentlyEditingFile && (showEditor || editMode);
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
      <FileContentLoadingIndicator />
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
