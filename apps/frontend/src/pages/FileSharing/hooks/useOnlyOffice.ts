import { useEffect, useMemo, useState } from 'react';
import { useAuth } from 'react-oidc-context';
import useFileEditorStore from '@/pages/FileSharing/previews/onlyOffice/useFileEditorStore';
import OnlyOfficeEditorConfig from '@libs/filesharing/types/OnlyOfficeEditorConfig';
import findDocumentsEditorType from '@/pages/FileSharing/previews/onlyOffice/utilities/documentsEditorType';
import callbackBaseUrl from '@/pages/FileSharing/previews/onlyOffice/utilities/callbackBaseUrl';
import generateOnlyOfficeConfig from '@/pages/FileSharing/previews/onlyOffice/utilities/generateOnlyOfficeConfig';
import useAppConfigsStore from '@/pages/Settings/AppConfig/appConfigsStore';
import { appExtendedOptions, AppExtendedOptions } from '@libs/appconfig/types/appExtendedType';
import getExtendedOptionValue from '@libs/appconfig/utils/getExtendedOptionValue';
import getFileExtension from '@libs/filesharing/utils/getFileExtension';
import onlyOfficeUrlConfig from '@libs/filesharing/utils/onlyOfficeUrlConfig';

interface UseOnlyOfficeProps {
  filePath: string;
  fileName: string;
  url: string;
  type: 'desktop' | 'mobile';
  mode: 'view' | 'edit';
}

const useOnlyOffice = ({ filePath, fileName, url, type, mode }: UseOnlyOfficeProps) => {
  const [editorsConfig, setEditorsConfig] = useState<OnlyOfficeEditorConfig | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { user } = useAuth();
  const { getOnlyOfficeJwtToken } = useFileEditorStore();

  const fileExtension = getFileExtension(fileName);
  const editorType = useMemo(() => findDocumentsEditorType(fileExtension), [fileExtension]);
  const formattedUrl = url.replace(onlyOfficeUrlConfig.localUrl, onlyOfficeUrlConfig.dockerUrl);
  const { appConfigs } = useAppConfigsStore();
  const documentServerURL = getExtendedOptionValue(appConfigs, appExtendedOptions, AppExtendedOptions.ONLY_OFFICE_URL);

  const callbackUrl = callbackBaseUrl({
    fileName,
    filePath,
    accessToken: user?.access_token || 'notfound',
  });

  useEffect(() => {
    const fetchFileUrlAndToken = async () => {
      const onlyOfficeConfig = generateOnlyOfficeConfig({
        fileType: fileExtension,
        type,
        editorConfigKey: editorType.key,
        documentTitle: fileName,
        documentUrl: formattedUrl,
        callbackUrl,
        mode,
        username: user?.profile.preferred_username || 'Anonymous',
      });
      onlyOfficeConfig.token = await getOnlyOfficeJwtToken(onlyOfficeConfig);
      setEditorsConfig(onlyOfficeConfig);
      setIsLoading(false);
    };

    void fetchFileUrlAndToken();
  }, [
    fileName,
    filePath,
    documentServerURL,
    formattedUrl,
    callbackUrl,
    getOnlyOfficeJwtToken,
    fileExtension,
    editorType.key,
    type,
    mode,
    user?.profile.preferred_username,
  ]);

  return {
    documentServerURL,
    editorType,
    isLoading,
    editorsConfig,
  };
};

export default useOnlyOffice;
