import { useEffect, useMemo, useState } from 'react';
import useFileEditorStore from '@/pages/FileSharing/previews/onlyOffice/useFileEditorStore';
import OnlyOfficeEditorConfig from '@libs/filesharing/types/OnlyOfficeEditorConfig';
import findDocumentsEditorType from '@/pages/FileSharing/previews/onlyOffice/utilities/documentsEditorType';
import getCallbackBaseUrl from '@/pages/FileSharing/previews/onlyOffice/utilities/callbackBaseUrl';
import generateOnlyOfficeConfig from '@/pages/FileSharing/previews/onlyOffice/utilities/generateOnlyOfficeConfig';
import useAppConfigsStore from '@/pages/Settings/AppConfig/appConfigsStore';
import getExtendedOptionValue from '@libs/appconfig/utils/getExtendedOptionValue';
import getFileExtension from '@libs/filesharing/utils/getFileExtension';
import useUserStore from '@/store/UserStore/UserStore';
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

  const fileExtension = getFileExtension(fileName);
  const editorType = useMemo(() => findDocumentsEditorType(fileExtension), [fileExtension]);
  const { appConfigs } = useAppConfigsStore();
  const documentServerURL = getExtendedOptionValue(
    appConfigs,
    APPS.FILE_SHARING,
    ExtendedOptionKeys.ONLY_OFFICE_URL,
  ) as string;

  const callbackUrl = getCallbackBaseUrl({
    fileName,
    filePath,
    token: eduApiToken,
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
