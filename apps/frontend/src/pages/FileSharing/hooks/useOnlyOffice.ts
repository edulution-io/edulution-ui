import { useEffect, useMemo, useState } from 'react';
import { useAuth } from 'react-oidc-context';
import appExtension from '@libs/appconfig/extensions/constants/appExtension';
import getExtendedOptionValue from '@libs/appconfig/utils/getExtendedOptionValue';
import OnlyOfficeEditorConfig from '@libs/filesharing/types/OnlyOfficeEditorConfig';
import getFileExtension from '@libs/filesharing/utils/getFileExtension';
import useFileEditorStore from '@/pages/FileSharing/previews/onlyOffice/useFileEditorStore';
import findDocumentsEditorType from '@/pages/FileSharing/previews/onlyOffice/utilities/documentsEditorType';
import callbackBaseUrl from '@/pages/FileSharing/previews/onlyOffice/utilities/callbackBaseUrl';
import generateOnlyOfficeConfig from '@/pages/FileSharing/previews/onlyOffice/utilities/generateOnlyOfficeConfig';
import useAppConfigsStore from '@/pages/Settings/AppConfig/appConfigsStore';
import FileSharingAppExtensions from '@libs/appconfig/extensions/types/file-sharing-app-extension-enum';

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
  const { appConfigs } = useAppConfigsStore();
  const documentServerURL = getExtendedOptionValue(appConfigs, appExtension, FileSharingAppExtensions.ONLY_OFFICE_URL);

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
        documentUrl: url,
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
    url,
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
