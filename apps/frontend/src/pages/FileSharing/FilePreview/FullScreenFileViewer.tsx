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
import PageLayout from '@/components/structure/layout/PageLayout';
import PageTitle from '@/components/PageTitle';
import useFileSharingDownloadStore from '@/pages/FileSharing/useFileSharingDownloadStore';

const FullScreenFileViewer = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const { loadDownloadUrl, temporaryDownloadUrl, isEditorLoading, isCreatingBlobUrl, isFetchingPublicUrl } =
    useFileSharingDownloadStore();

  const { filesToOpenInNewTab, currentlyEditingFile, setCurrentlyEditingFile } = useFileEditorStore();
  const [isLoading, setIsLoading] = useState(true);
  const fileETag = searchParams.get('file');

  const initializeFile = async () => {
    const fileToOpen = filesToOpenInNewTab.find((f) => f.etag === fileETag);
    if (fileToOpen) {
      await loadDownloadUrl(fileToOpen);
      setCurrentlyEditingFile(fileToOpen);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void initializeFile();
  }, []);

  useBeforeUnload(t('closeEditingWindow'));

  if (isLoading || isEditorLoading || isCreatingBlobUrl || isFetchingPublicUrl)
    return <LoadingIndicatorDialog isOpen />;

  if (!temporaryDownloadUrl) return null;

  return (
    <PageLayout isFullScreen>
      <PageTitle
        title={currentlyEditingFile?.filename}
        translationId="filesharing.sidebar"
      />
      <FileRenderer
        editMode
        isOpenedInNewTab
      />
    </PageLayout>
  );
};

export default FullScreenFileViewer;
