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

import React, { FC, ReactNode } from 'react';
import { MdFullscreen } from 'react-icons/md';
import { IoIosArrowForward } from 'react-icons/io';
import { ImNewTab } from 'react-icons/im';
import { useTranslation } from 'react-i18next';

import FilePreviewOptionsButton from '@/pages/FileSharing/buttonsBar/FilePreviewOptionsButton';
import useFileSharingStore from '@/pages/FileSharing/useFileSharingStore';
import useBeforeUnload from '@/hooks/useBeforeUnload';
import FILE_PREVIEW_ROUTE from '@libs/filesharing/constants/routes';
import useFileEditorStore from '@/pages/FileSharing/previews/onlyOffice/useFileEditorStore';

interface FileViewerLayoutProps {
  isLoading: boolean;
  children: ReactNode;
  editMode?: boolean;
}

const FileViewerLayout: FC<FileViewerLayoutProps> = ({ isLoading, children, editMode = false }) => {
  const { setCurrentlyEditingFile, currentlyEditingFile, setIsFullScreenEditingEnabled } = useFileSharingStore();
  const { setShowEditor } = useFileEditorStore();
  const { t } = useTranslation();

  useBeforeUnload(editMode ? t('closeEditingWindow') : '');

  const openInNewTab = () => {
    if (currentlyEditingFile) {
      window.open(`/${FILE_PREVIEW_ROUTE}?tab=true`, '_blank');
      setShowEditor(false);
    }
  };

  const isDocumentReady = currentlyEditingFile && !isLoading && !editMode;

  return (
    <>
      {!editMode && (
        <div className="pb-1">
          <p>{t('filesharing.previewTitle')}:</p>
        </div>
      )}
      <div className="flex w-full flex-row">
        {isDocumentReady && (
          <FilePreviewOptionsButton
            icon={<IoIosArrowForward />}
            onClick={() => setCurrentlyEditingFile(null)}
          />
        )}
        <div className="flex-grow">{children}</div>

        {isDocumentReady && (
          <div className="flex flex-col space-y-2">
            <FilePreviewOptionsButton
              icon={<ImNewTab />}
              onClick={openInNewTab}
            />
            <FilePreviewOptionsButton
              icon={<MdFullscreen />}
              onClick={() => setIsFullScreenEditingEnabled(true)}
            />
          </div>
        )}
      </div>
    </>
  );
};

export default FileViewerLayout;
