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
import isTextExtension from '@libs/filesharing/utils/isTextExtension';
import getFileExtension from '@libs/filesharing/utils/getFileExtension';
import isOfficeDocument from '@libs/filesharing/utils/isOfficeDocument';
import useActiveDocumentEditor from '@/pages/FileSharing/hooks/useActiveDocumentEditor';
import useFileEditorContentStore from '@/pages/FileSharing/FilePreview/useFileEditorContentStore';
import isDrawioExtension from '@libs/filesharing/utils/isDrawioExtension';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { SaveIcon } from '@libs/common/constants/standardActionIcons';
import { Button } from '@edulution-io/ui-kit';

const FullScreenFileViewer = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const webdavShare = searchParams.get('share') || undefined;
  const { loadDownloadUrl, temporaryDownloadUrl, isEditorLoading, isCreatingBlobUrl, isFetchingPublicUrl } =
    useFileSharingDownloadStore();

  const { filesToOpenInNewTab, currentlyEditingFile, setCurrentlyEditingFile } = useFileEditorStore();
  const { hasUnsavedChanges, hasDrawioUnsavedChanges, isSaving, saveFile } = useFileEditorContentStore();
  const { isOnlyOfficeActive, isCollaboraActive } = useActiveDocumentEditor();

  const [isLoading, setIsLoading] = useState(true);
  const fileETag = searchParams.get('file');

  const fileExtension = currentlyEditingFile ? getFileExtension(currentlyEditingFile.filePath) : undefined;
  const isTextFile = isTextExtension(fileExtension);
  const isDrawioFile = isDrawioExtension(fileExtension);

  const isCollaboraDoc = isCollaboraActive && !!currentlyEditingFile && isOfficeDocument(currentlyEditingFile.filePath);

  const initializeFile = async () => {
    const fileToOpen = filesToOpenInNewTab.find((f) => f.etag === fileETag);
    if (fileToOpen) {
      const isCollaboraFile = isCollaboraActive && isOfficeDocument(fileToOpen.filePath);
      if (!isCollaboraFile) {
        await loadDownloadUrl(fileToOpen, webdavShare);
      }
      setCurrentlyEditingFile(fileToOpen);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void initializeFile();
  }, []);

  const handleSaveFile = () => saveFile(webdavShare);

  useBeforeUnload(t('closeEditingWindow'));

  if (isLoading || isEditorLoading || isCreatingBlobUrl || isFetchingPublicUrl)
    return <LoadingIndicatorDialog isOpen />;

  if (!temporaryDownloadUrl && !isCollaboraDoc) return null;

  const hasTextChanges = isTextFile && hasUnsavedChanges();
  const hasDrawioChanges = isDrawioFile && hasDrawioUnsavedChanges();
  const showSaveButton = hasTextChanges || hasDrawioChanges;

  return (
    <PageLayout isFullScreenAppWithoutFloatingButtons>
      <PageTitle
        title={currentlyEditingFile?.filename}
        translationId="filesharing.sidebar"
      />
      <FileRenderer
        editMode
        isOpenedInNewTab
        isOnlyOfficeConfigured={isOnlyOfficeActive}
        isCollaboraConfigured={isCollaboraActive}
        webdavShare={webdavShare}
      />
      {showSaveButton && (
        <Button
          onClick={handleSaveFile}
          disabled={isSaving}
          size="md"
          className="absolute bottom-4 right-4 z-50"
          variant="btn-collaboration"
        >
          <FontAwesomeIcon icon={SaveIcon} />
          {isSaving ? t('filesharing.textEditor.saving') : t('common.save')}
        </Button>
      )}
    </PageLayout>
  );
};

export default FullScreenFileViewer;
