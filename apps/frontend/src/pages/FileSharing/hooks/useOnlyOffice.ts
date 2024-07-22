import { useEffect, useMemo, useState } from 'react';
import { useAuth } from 'react-oidc-context';
import useFileEditorStore from '@/pages/FileSharing/previews/onlyOffice/fileEditorStore';
import findDocumentsEditorType from '@/pages/FileSharing/previews/onlyOffice/documentsEditorType';
import callbackBaseUrl from '@/pages/FileSharing/previews/onlyOffice/callbackBaseUrl';
import generateOnlyOfficeConfig from '@/pages/FileSharing/previews/onlyOffice/generateOnlyOfficeConfig';
import OnlyOfficeEditorConfig from '@/pages/FileSharing/previews/onlyOffice/OnlyOfficeEditorConfig';
import OnlyOfficeConfig from '@/pages/FileSharing/previews/onlyOffice/OnlyOfficeConfig';

interface UseOnlyOfficeProps {
  filePath: string;
  fileName: string;
  url: string;
  type: 'desktop' | 'mobile';
  mode: 'view' | 'edit';
}

const useOnlyOffice: ({ filePath, fileName, url, type, mode }: UseOnlyOfficeProps) => {
  isLoading: boolean;
  editorsConfig: OnlyOfficeEditorConfig | null;
  documentServerURL: string;
  editorType: OnlyOfficeConfig;
} = ({ filePath, fileName, url, type, mode }: UseOnlyOfficeProps) => {
  const [editorsConfig, setEditorsConfig] = useState<OnlyOfficeEditorConfig | null>(null);
  const [documentServerURL, setDocumentServerURL] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { user } = useAuth();
  const { getOnlyOfficeJwtToken } = useFileEditorStore();

  const fileExtension = fileName.split('.').pop() || '';
  const editorType = useMemo(() => findDocumentsEditorType(fileExtension), [fileExtension]);
  const isDev = true;
  const formattedUrl = useMemo(
    () => (isDev ? url.replace('http://localhost:3001', 'http://host.docker.internal:3001') : url),
    [url, isDev],
  );
  const documentSerURL = useMemo(
    () => (isDev ? 'http://localhost:80' : (import.meta.env.VITE_ONLYOFFICE_URL as string)),
    [isDev],
  );

  const generatedCallbackUrl = useMemo(
    () =>
      callbackBaseUrl({
        fileName,
        filePath,
        isDev,
        accessToken: user?.access_token || 'notfound',
      }),
    [fileName, filePath, isDev, user?.access_token],
  );

  useEffect(() => {
    const fetchFileUrlAndToken = async () => {
      try {
        setDocumentServerURL(documentSerURL);

        const onlyOfficeConfig = generateOnlyOfficeConfig({
          fileType: fileExtension,
          type,
          editorConfigKey: editorType.key,
          documentTitle: fileName,
          documentUrl: formattedUrl,
          callBackUrl: generatedCallbackUrl,
          mode,
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
    documentSerURL,
    formattedUrl,
    generatedCallbackUrl,
    getOnlyOfficeJwtToken,
    fileExtension,
    editorType.key,
    type,
    mode,
  ]);

  return {
    documentServerURL,
    editorType,
    isLoading,
    editorsConfig,
  };
};

export default useOnlyOffice;
