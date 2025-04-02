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

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import useBeforeUnload from '@/hooks/useBeforeUnload';
import { useTranslation } from 'react-i18next';
import FileRenderer from '@/pages/FileSharing/FilePreview/FileRenderer';
import useFileEditorStore from '@/pages/FileSharing/FilePreview/OnlyOffice/useFileEditorStore';
import LoadingIndicatorDialog from '@/components/ui/Loading/LoadingIndicatorDialog';
import PageTitle from '@/components/PageTitle';

const FullScreenFileViewer = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const {
    filesToOpenInNewTab,
    fetchDownloadLinks,
    currentlyEditingFile,
    setCurrentlyEditingFile,
    downloadLinkURL,
    isEditorLoading,
    isDownloadFileLoading,
    isGetDownloadLinkUrlLoading,
  } = useFileEditorStore();
  const [isLoading, setIsLoading] = useState(true);

  const fileETag = searchParams.get('file');

  const initializeFile = async () => {
    const fileToOpen = filesToOpenInNewTab.find((f) => f.etag === fileETag);
    if (fileToOpen) {
      await fetchDownloadLinks(fileToOpen);
      setCurrentlyEditingFile(fileToOpen);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void initializeFile();
  }, []);

  useBeforeUnload(t('closeEditingWindow'));

  if (isLoading || isEditorLoading || isDownloadFileLoading || isGetDownloadLinkUrlLoading)
    return <LoadingIndicatorDialog isOpen />;

  if (!downloadLinkURL) return null;

  return (
    <div className="h-screen w-screen">
      <PageTitle
        title={currentlyEditingFile?.basename}
        translationId="filesharing.sidebar"
      />
      <FileRenderer
        editMode
        isOpenedInNewTab
      />
    </div>
  );
};

export default FullScreenFileViewer;
