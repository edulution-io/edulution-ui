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

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import useAppConfigsStore from '@/pages/Settings/AppConfig/useAppConfigsStore';
import getExtendedOptionsValue from '@libs/appconfig/utils/getExtendedOptionsValue';
import APPS from '@libs/appconfig/constants/apps';
import ExtendedOptionKeys from '@libs/appconfig/constants/extendedOptionKeys';
import eduApi from '@/api/eduApi';
import FileSharingApiEndpoints from '@libs/filesharing/types/fileSharingApiEndpoints';
import getFrontEndUrl from '@libs/common/utils/URL/getFrontEndUrl';
import EDU_API_ROOT from '@libs/common/constants/eduApiRoot';
import WopiAccessToken from '@libs/filesharing/types/wopiAccessToken';

interface UseCollaboraProps {
  filePath: string;
  fileName: string;
  mode: 'view' | 'edit';
}

const useCollabora = ({ filePath, fileName, mode }: UseCollaboraProps) => {
  const { webdavShare } = useParams();
  const [accessToken, setAccessToken] = useState<string>('');
  const [accessTokenTTL, setAccessTokenTTL] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  const { appConfigs } = useAppConfigsStore();
  const collaboraUrl = getExtendedOptionsValue(appConfigs, APPS.FILE_SHARING, ExtendedOptionKeys.COLLABORA_URL);

  const fileId = btoa(filePath).replace(/[/+=]/g, '_');
  const wopiSrc = `${getFrontEndUrl()}/${EDU_API_ROOT}/wopi/files/${fileId}`;

  useEffect(() => {
    const fetchToken = async () => {
      try {
        setIsLoading(true);
        const response = await eduApi.post<WopiAccessToken>(
          `${FileSharingApiEndpoints.FILESHARING_ACTIONS}/${FileSharingApiEndpoints.COLLABORA_TOKEN}`,
          {
            filePath,
            share: webdavShare,
            canWrite: mode === 'edit',
          },
        );
        setAccessToken(response.data.accessToken);
        setAccessTokenTTL(response.data.accessTokenTTL);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchToken();
  }, [filePath, fileName, mode, webdavShare]);

  return {
    collaboraUrl: collaboraUrl || '',
    wopiSrc,
    accessToken,
    accessTokenTTL,
    isLoading,
  };
};

export default useCollabora;
