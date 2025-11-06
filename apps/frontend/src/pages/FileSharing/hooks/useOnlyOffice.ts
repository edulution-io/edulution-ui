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

import { useEffect, useMemo, useState } from 'react';
import useFileEditorStore from '@/pages/FileSharing/FilePreview/OnlyOffice/useFileEditorStore';
import OnlyOfficeEditorConfig from '@libs/filesharing/types/OnlyOfficeEditorConfig';
import findDocumentsEditorType from '@/pages/FileSharing/FilePreview/OnlyOffice/utilities/documentsEditorType';
import getCallbackBaseUrl from '@/pages/FileSharing/FilePreview/OnlyOffice/utilities/getCallbackBaseUrl';
import generateOnlyOfficeConfig from '@/pages/FileSharing/FilePreview/OnlyOffice/utilities/generateOnlyOfficeConfig';
import useAppConfigsStore from '@/pages/Settings/AppConfig/useAppConfigsStore';
import getExtendedOptionsValue from '@libs/appconfig/utils/getExtendedOptionsValue';
import getFileExtension from '@libs/filesharing/utils/getFileExtension';
import useUserStore from '@/store/UserStore/useUserStore';
import ExtendedOptionKeys from '@libs/appconfig/constants/extendedOptionKeys';
import APPS from '@libs/appconfig/constants/apps';
import useLanguage from '@/hooks/useLanguage';
import { useParams } from 'react-router-dom';

interface UseOnlyOfficeProps {
  filePath: string;
  fileName: string;
  url: string;
  type: 'desktop' | 'mobile';
  mode: 'view' | 'edit';
}

const useOnlyOffice = ({ filePath, fileName, url, type, mode }: UseOnlyOfficeProps) => {
  const { webdavShare } = useParams();
  const [editorConfig, setEditorConfig] = useState<OnlyOfficeEditorConfig | null>(null);
  const { eduApiToken, user } = useUserStore();
  const { getOnlyOfficeJwtToken } = useFileEditorStore();
  const { language } = useLanguage();

  const token = useMemo(() => eduApiToken, [filePath, fileName]);

  const fileExtension = getFileExtension(fileName);
  const editorType = useMemo(() => findDocumentsEditorType(fileExtension), [fileExtension]);
  const { appConfigs } = useAppConfigsStore();
  const documentServerURL = getExtendedOptionsValue(
    appConfigs,
    APPS.FILE_SHARING,
    ExtendedOptionKeys.ONLY_OFFICE_URL,
  ) as string;

  const callbackUrl = getCallbackBaseUrl({
    fileName,
    filePath,
    token,
    share: webdavShare,
  });

  useEffect(() => {
    const fetchFileUrlAndToken = async () => {
      const onlyOfficeConfig = generateOnlyOfficeConfig({
        fileType: fileExtension,
        type,
        editorType,
        documentTitle: fileName,
        documentUrl: url,
        callbackUrl,
        mode,
        username: user?.username || '',
        lang: language,
      });
      onlyOfficeConfig.token = await getOnlyOfficeJwtToken(onlyOfficeConfig);
      setEditorConfig(onlyOfficeConfig);
    };

    void fetchFileUrlAndToken();
  }, [fileName, filePath, documentServerURL, url, callbackUrl, fileExtension, editorType.key, type, mode, user]);

  return {
    documentServerURL,
    editorType,
    editorConfig,
  };
};

export default useOnlyOffice;
