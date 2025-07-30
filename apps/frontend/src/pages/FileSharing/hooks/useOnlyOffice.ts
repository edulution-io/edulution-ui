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

import { useEffect, useMemo, useState } from 'react';
import useFileEditorStore from '@/pages/FileSharing/FilePreview/OnlyOffice/useFileEditorStore';
import OnlyOfficeEditorConfig from '@libs/filesharing/types/OnlyOfficeEditorConfig';
import findDocumentsEditorType from '@/pages/FileSharing/FilePreview/OnlyOffice/utilities/documentsEditorType';
import getCallbackBaseUrl from '@/pages/FileSharing/FilePreview/OnlyOffice/utilities/callbackBaseUrl';
import generateOnlyOfficeConfig from '@/pages/FileSharing/FilePreview/OnlyOffice/utilities/generateOnlyOfficeConfig';
import useAppConfigsStore from '@/pages/Settings/AppConfig/useAppConfigsStore';
import getExtendedOptionsValue from '@libs/appconfig/utils/getExtendedOptionsValue';
import getFileExtension from '@libs/filesharing/utils/getFileExtension';
import useUserStore from '@/store/UserStore/useUserStore';
import ExtendedOptionKeys from '@libs/appconfig/constants/extendedOptionKeys';
import APPS from '@libs/appconfig/constants/apps';
import useLanguage from '@/hooks/useLanguage';

interface UseOnlyOfficeProps {
  filePath: string;
  fileName: string;
  url: string;
  type: 'desktop' | 'mobile';
  mode: 'view' | 'edit';
}

const useOnlyOffice = ({ filePath, fileName, url, type, mode }: UseOnlyOfficeProps) => {
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
