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
import useFileSharingStore from '@/pages/FileSharing/useFileSharingStore';
import FileViewerLayout from '@/pages/FileSharing/previews/utilities/FileViewerLayout';
import FileRenderer from '@/pages/FileSharing/previews/utilities/FileRenderer';
import useDownloadLinks from '@/pages/FileSharing/hooks/useDownloadLinks';
import ResizableWindow from '@/components/framing/ResizableWindow/ResizableWindow';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';

interface FileViewerProps {
  editMode: boolean;
}

const FileViewer: FC<FileViewerProps> = ({ editMode }) => {
  const { t } = useTranslation();
  const { currentlyEditingFile, isFullScreenEditingEnabled, setIsFullScreenEditingEnabled } = useFileSharingStore();
  const { isEditorLoading } = useFileSharingStore();
  const [searchParams] = useSearchParams();
  useDownloadLinks(currentlyEditingFile);

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
          handleClose={() => setIsFullScreenEditingEnabled(false)}
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
