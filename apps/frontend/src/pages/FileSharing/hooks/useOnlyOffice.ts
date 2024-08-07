import { useEffect, useMemo, useState } from 'react';
import { useAuth } from 'react-oidc-context';
import useFileEditorStore from '@/pages/FileSharing/previews/onlyOffice/fileEditorStore';
import OnlyOfficeEditorConfig from '@libs/filesharing/types/OnlyOfficeEditorConfig';
import findDocumentsEditorType from '@/pages/FileSharing/previews/onlyOffice/utilities/documentsEditorType';
import callbackBaseUrl from '@/pages/FileSharing/previews/onlyOffice/utilities/callbackBaseUrl';
import generateOnlyOfficeConfig from '@/pages/FileSharing/previews/onlyOffice/utilities/generateOnlyOfficeConfig';

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

  const fileExtension = useMemo(() => fileName.split('.').pop() || '', [fileName]);
  const editorType = useMemo(() => findDocumentsEditorType(fileExtension), [fileExtension]);
  const formattedUrl = useMemo(() => url.replace('http://localhost:3001', 'http://host.docker.internal:3001'), [url]);
  const documentServerURL = 'http://localhost:80';

  const generatedCallbackUrl = useMemo(() => {
    const callbackUrl = callbackBaseUrl({
      fileName,
      filePath,
      accessToken: user?.access_token || 'notfound',
    });
    if (!callbackUrl) {
      console.error('Generated callback URL is invalid:', callbackUrl);
    }
    return callbackUrl;
  }, [fileName, filePath, user?.access_token]);

  useEffect(() => {
    const fetchFileUrlAndToken = async () => {
      try {
        const onlyOfficeConfig = generateOnlyOfficeConfig({
          fileType: fileExtension,
          type,
          editorConfigKey: editorType.key,
          documentTitle: fileName,
          documentUrl: formattedUrl,
          callbackUrl: generatedCallbackUrl,
          mode,
          username: user?.profile.preferred_username || 'Anonymous',
        });
        onlyOfficeConfig.token = await getOnlyOfficeJwtToken(onlyOfficeConfig);
        setEditorsConfig(onlyOfficeConfig);
      } catch (err) {
        console.error('Error fetching OnlyOffice JWT token or file URL:', err);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchFileUrlAndToken();
  }, [
    fileName,
    filePath,
    documentServerURL,
    formattedUrl,
    generatedCallbackUrl,
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
