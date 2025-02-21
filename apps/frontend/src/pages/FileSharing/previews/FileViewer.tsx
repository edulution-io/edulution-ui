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

import React, { FC, useEffect } from 'react';
import useFileSharingStore from '@/pages/FileSharing/useFileSharingStore';
import FileViewerLayout from '@/pages/FileSharing/previews/utilities/FileViewerLayout';
import FileRenderer from '@/pages/FileSharing/previews/utilities/FileRenderer';
import ResizableWindow from '@/components/framing/ResizableWindow/ResizableWindow';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';

interface FileViewerProps {
  editMode: boolean;
}

const FileViewer: FC<FileViewerProps> = ({ editMode }) => {
  const { t } = useTranslation();
  const {
    currentlyEditingFile,
    isEditorLoading,
    isFullScreenEditingEnabled,
    setIsFullScreenEditingEnabled,
    fetchDownloadLinks,
    startFileIsCurrentlyDisabled,
    setCurrentlyEditingFile,
  } = useFileSharingStore();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (currentlyEditingFile) {
      void fetchDownloadLinks(currentlyEditingFile);
    }
  }, [currentlyEditingFile, isFullScreenEditingEnabled]);

  const handleCloseFile = async () => {
    if (!currentlyEditingFile) return;
    const { basename } = currentlyEditingFile;
    setIsFullScreenEditingEnabled(false);
    setCurrentlyEditingFile(null);
    await startFileIsCurrentlyDisabled(basename, true, 5000);
  };

  const isOpenedInNewTab = Boolean(searchParams.get('tab'));

  return (
    <FileViewerLayout
      isLoading={isEditorLoading}
      editMode={isOpenedInNewTab}
    >
      {isFullScreenEditingEnabled && !isOpenedInNewTab ? (
        <ResizableWindow
          disableMinimizeWindow
          disableToggleMaximizeWindow
          titleTranslationId={t('filesharing.fileEditor')}
          handleClose={() => handleCloseFile()}
        >
          <FileRenderer editMode />
        </ResizableWindow>
      ) : (
        <FileRenderer editMode={editMode} />
      )}
    </FileViewerLayout>
  );
};

export default FileViewer;
