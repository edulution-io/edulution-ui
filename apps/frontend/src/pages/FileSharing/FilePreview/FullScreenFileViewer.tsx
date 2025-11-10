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
import getExtendedOptionsValue from '@libs/appconfig/utils/getExtendedOptionsValue';
import useAppConfigsStore from '@/pages/Settings/AppConfig/useAppConfigsStore';
import APPS from '@libs/appconfig/constants/apps';
import ExtendedOptionKeys from '@libs/appconfig/constants/extendedOptionKeys';

const FullScreenFileViewer = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const webdavShare = searchParams.get('share') || undefined;
  const { loadDownloadUrl, temporaryDownloadUrl, isEditorLoading, isCreatingBlobUrl, isFetchingPublicUrl } =
    useFileSharingDownloadStore();

  const { filesToOpenInNewTab, currentlyEditingFile, setCurrentlyEditingFile } = useFileEditorStore();
  const appConfigs = useAppConfigsStore((s) => s.appConfigs);

  const [isLoading, setIsLoading] = useState(true);
  const fileETag = searchParams.get('file');

  const isDocumentServerConfigured = !!getExtendedOptionsValue(
    appConfigs,
    APPS.FILE_SHARING,
    ExtendedOptionKeys.ONLY_OFFICE_URL,
  );

  const initializeFile = async () => {
    const fileToOpen = filesToOpenInNewTab.find((f) => f.etag === fileETag);
    if (fileToOpen) {
      await loadDownloadUrl(fileToOpen, webdavShare);
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
        isOnlyOfficeConfigured={isDocumentServerConfigured}
      />
    </PageLayout>
  );
};

export default FullScreenFileViewer;
