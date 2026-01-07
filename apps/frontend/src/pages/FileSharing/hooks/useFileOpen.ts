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

import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DirectoryFileDTO } from '@libs/filesharing/types/directoryFileDTO';
import ContentType from '@libs/filesharing/types/contentType';
import PARENT_FOLDER_PATH from '@libs/filesharing/constants/parentFolderPath';
import URL_SEARCH_PARAMS from '@libs/common/constants/url-search-params';
import isValidFileToPreview from '@libs/filesharing/utils/isValidFileToPreview';
import isOnlyOfficeDocument from '@libs/filesharing/utils/isOnlyOfficeDocument';
import useMedia from '@/hooks/useMedia';
import useFileEditorStore from '@/pages/FileSharing/FilePreview/OnlyOffice/useFileEditorStore';
import useFileSharingStore from '@/pages/FileSharing/useFileSharingStore';
import useFileSharingDownloadStore from '@/pages/FileSharing/useFileSharingDownloadStore';

interface UseFileOpenOptions {
  isDocumentServerConfigured: boolean;
}

const useFileOpen = ({ isDocumentServerConfigured }: UseFileOpenOptions) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isMobileView } = useMedia();
  const { isFilePreviewDocked, setIsFilePreviewVisible, resetCurrentlyEditingFile } = useFileEditorStore();
  const { currentlyDisabledFiles, setFileIsCurrentlyDisabled } = useFileSharingStore();
  const { setPublicDownloadLink } = useFileSharingDownloadStore();

  const handleFileOpen = useCallback(
    (item: DirectoryFileDTO) => {
      const isCurrentlyDisabled = currentlyDisabledFiles[item.filename];
      if (isCurrentlyDisabled) return;

      setPublicDownloadLink('');

      if (item.type === ContentType.DIRECTORY) {
        if (isFilePreviewDocked) setIsFilePreviewVisible(false);
        const newParams = new URLSearchParams(searchParams);

        if (item.filePath === PARENT_FOLDER_PATH) {
          const currentPathParam = searchParams.get(URL_SEARCH_PARAMS.PATH) || '/';
          const hadTrailingSlash = currentPathParam.endsWith('/') && currentPathParam !== '/';
          const pathParts = currentPathParam.split('/').filter(Boolean);
          let parentPath = pathParts.length > 1 ? `/${pathParts.slice(0, -1).join('/')}` : '/';
          if (hadTrailingSlash && parentPath !== '/') {
            parentPath += '/';
          }
          newParams.set(URL_SEARCH_PARAMS.PATH, parentPath);
        } else {
          newParams.set(URL_SEARCH_PARAMS.PATH, item.filePath);
        }

        setSearchParams(newParams);
        return;
      }

      if (!isValidFileToPreview(item)) {
        return;
      }

      const isPdf = item.filename.toLowerCase().endsWith('.pdf');
      const isOnlyOfficeDoc = isOnlyOfficeDocument(item.filename);

      if (isOnlyOfficeDoc && !isDocumentServerConfigured && !isPdf) {
        return;
      }
      if (isMobileView && isOnlyOfficeDoc && isDocumentServerConfigured && !isPdf) {
        return;
      }
      if (isOnlyOfficeDoc || isPdf) {
        void setFileIsCurrentlyDisabled(item.filename, true, 5000);
      }

      setIsFilePreviewVisible(true);
      void resetCurrentlyEditingFile(item);
    },
    [
      currentlyDisabledFiles,
      setPublicDownloadLink,
      isFilePreviewDocked,
      setIsFilePreviewVisible,
      searchParams,
      setSearchParams,
      isDocumentServerConfigured,
      isMobileView,
      setFileIsCurrentlyDisabled,
      resetCurrentlyEditingFile,
    ],
  );

  return { handleFileOpen };
};

export default useFileOpen;
