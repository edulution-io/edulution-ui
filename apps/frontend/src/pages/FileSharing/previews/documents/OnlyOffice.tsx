import React, { FC, useEffect, useState } from 'react';
import { DocumentEditor } from '@onlyoffice/document-editor-react';
import { DirectoryFile } from '@/datatypes/filesystem';
import useFileManagerStore from '@/pages/FileSharing/fileManagerStore';
import useFileEditorStore from './fileEditorStore';
import PreviewMenuBar from '@/pages/FileSharing/previews/documents/PreviewMenuBar.tsx';
import { useAuth } from 'react-oidc-context';

interface OnlyOfficeProps {
  file: DirectoryFile;
  type: 'desktop' | 'mobile';
  mode: 'view' | 'edit';
  onClose: () => void;
  isPreview?: boolean;
}

interface OnlyOfficeConfig {
  id: string;
  key: string;
  documentType: string;
}

const getFileType = (filename: string): string => {
  const extension = filename.split('.').pop();
  return extension ? extension.toLowerCase() : '';
};

const findDocumentsEditorType = (fileType: string): OnlyOfficeConfig => {
  switch (fileType) {
    case 'doc':
    case 'docx':
      return { id: 'docxEditor', key: 'docx' + Math.random() * 100, documentType: 'word' };
    case 'xlsx':
    case 'csv':
      return { id: 'xlsxEditor', key: 'xlsx' + Math.random() * 100, documentType: 'cell' };
    case 'pptx':
      return { id: 'pptxEditor', key: 'pptx' + Math.random() * 100, documentType: 'slide' };
    case 'pdf':
      return { id: 'pdfEditor', key: 'pdf' + Math.random() * 100, documentType: 'word' };
    default:
      return { id: 'docxEditor', key: 'word' + Math.random() * 100, documentType: 'word' };
  }
};

const OnlyOffice: FC<OnlyOfficeProps> = ({ file, mode, type, onClose, isPreview }) => {
  const [token, setToken] = useState<string | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [documentServerURL, setDocumentServerURL] = useState<string>('');
  const { user } = useAuth();
  const [editorType, setEditorType] = useState<OnlyOfficeConfig>({
    id: 'docxEditor',
    key: 'word' + Math.random(),
    documentType: 'word',
  });

  const { previewFile, appendEditorFile } = useFileEditorStore();
  const { getOnlyOfficeJwtToken, downloadFile } = useFileManagerStore();
  useEffect(() => {
    const fileType = getFileType(file.filename);
    const editorConfig = findDocumentsEditorType(fileType);
    console.log(editorConfig);
    setEditorType(editorConfig);

    const fetchFileUrlAndToken = async () => {
      try {
        const rawUrl = await downloadFile(file.filename);
        const isDev = (import.meta.env.VITE_ENV as string) === 'dev';

        const formattedUrl = isDev
          ? rawUrl.replace('http://localhost:3001', 'http://host.docker.internal:3001')
          : rawUrl;
        const callbackBaseUrl = isDev
          ? `${import.meta.env.VITE_ONLYOFFICE_DEV}?path=${encodeURIComponent(file.filename)}&filename=${encodeURIComponent(file.basename)}&eduToken=${encodeURIComponent(user?.access_token || 'notfound')}`
          : `${import.meta.env.VITE_ONLYOFFICE_PROD}?path=${encodeURIComponent(file.filename)}&filename=${encodeURIComponent(file.basename)}&eduToken=${encodeURIComponent(user?.access_token || 'notfound')}`;

        console.log(`({
                  file, getOnlyOfficeJwtToken, previewFile, mode, rawUrl, isDev, callbackBaseUrl
                }) ${JSON.stringify(
                  {
                    file,
                    getOnlyOfficeJwtToken,
                    previewFile,
                    mode,
                    rawUrl,
                    isDev,
                    callbackBaseUrl,
                  },
                  null,
                  2,
                )}`);

        const documentSerURL = isDev ? 'http://localhost:80' : (import.meta.env.VITE_ONLYOFFICE_URL as string);

        setDocumentServerURL(documentSerURL);
        console.log(callbackBaseUrl);
        setFileUrl(formattedUrl);

        console.log(`CallbackURL`, `CallbackURL${callbackBaseUrl}`);

        const config = {
          document: {
            fileType,
            type,
            key: editorConfig.key,
            title: file.basename,
            url: import.meta.env.VITE_ENV === 'dev' ? formattedUrl : rawUrl,
            height: '100%',
            width: '100%',
          },
          documentType: editorConfig.documentType,
          editorConfig: {
            callbackUrl: isDev
              ? `${import.meta.env.VITE_ONLYOFFICE_CALLBACK_DEV}?path=${encodeURIComponent(file.filename)}&filename=${encodeURIComponent(file.basename)}&eduToken=${encodeURIComponent(user?.access_token || 'notfound')}`
              : `${import.meta.env.VITE_ONLYOFFICE_CALLBACK_PROD}?path=${encodeURIComponent(file.filename)}&filename=${encodeURIComponent(file.basename)}&eduToken=${encodeURIComponent(user?.access_token || 'notfound')}`,
            mode,
            customization: {
              anonymous: {
                request: true,
                label: 'Guest',
              },
              autosave: true,
              comments: true,
              compactHeader: false,
              compactToolbar: false,
              compatibleFeatures: false,
              forcesave: false,
              help: true,
              hideRightMenu: false,
              hideRulers: false,
              integrationMode: 'embed',
              macros: true,
              macrosMode: 'Warn',
              mentionShare: true,
              mobileForceView: true,
              plugins: true,
              toolbarHideFileName: false,
              toolbarNoTabs: false,
              uiTheme: 'theme-dark',
              unit: 'cm',
              zoom: 100,
            },
          },
        };
        const generatedToken = await getOnlyOfficeJwtToken(config);
        setToken(generatedToken);
      } catch (error) {
        console.error('Error fetching OnlyOffice JWT token or file URL:', error);
      }
    };

    if (editorConfig) {
      fetchFileUrlAndToken();
    }
  }, [file, getOnlyOfficeJwtToken, previewFile, mode]);

  return (
    <div className={`relative ${isPreview ? 'h-[75vh]' : 'h-[100vh]'}`}>
      {isPreview && (
        <PreviewMenuBar
          file={file}
          previewFile={previewFile}
          onClose={onClose}
          appendEditorFile={appendEditorFile}
        />
      )}
      {token && editorType ? (
        <DocumentEditor
          key={editorType.key}
          id={editorType.id}
          documentServerUrl={documentServerURL}
          config={{
            document: {
              fileType: getFileType(file.filename),
              key: editorType.key,
              title: file.basename,
              url: fileUrl || '',
            },
            documentType: editorType.documentType,
            token,
            editorConfig: {
              callbackUrl:
                (import.meta.env.VITE_ENV as string) === 'dev'
                  ? `${import.meta.env.VITE_ONLYOFFICE_CALLBACK_DEV}?path=${encodeURIComponent(file.filename)}&filename=${encodeURIComponent(file.basename)}&eduToken=${encodeURIComponent(user?.access_token || 'notfound')}`
                  : `${import.meta.env.VITE_ONLYOFFICE_CALLBACK_PROD}?path=${encodeURIComponent(file.filename)}&filename=${encodeURIComponent(file.basename)}&eduToken=${encodeURIComponent(user?.access_token || 'notfound')}`,
              mode,
              customization: {
                anonymous: {
                  request: true,
                  label: 'Guest',
                },
                autosave: true,
                comments: true,
                compactHeader: false,
                compactToolbar: false,
                compatibleFeatures: false,
                forcesave: false,
                help: true,
                hideRightMenu: false,
                hideRulers: false,
                integrationMode: 'embed',
                macros: true,
                macrosMode: 'Warn',
                mentionShare: true,
                mobileForceView: true,
                plugins: true,
                toolbarHideFileName: false,
                toolbarNoTabs: false,
                uiTheme: 'theme-dark',
                unit: 'cm',
                zoom: 100,
              },
            },
          }}
        />
      ) : (
        <div>Loading document...</div>
      )}
    </div>
  );
};

export default OnlyOffice;
