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
      return { id: 'pdfEditor', key: 'pdf' + Math.random() * 100, documentType: 'pdf' };
    default:
      return { id: 'docxEditor', key: 'word' + Math.random() * 100, documentType: 'word' };
  }
};

const OnlyOffice: FC<OnlyOfficeProps> = ({ file, mode, type, onClose, isPreview }) => {
  const [token, setToken] = useState<string | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
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
    setEditorType(editorConfig);

    const dev = false;

    const fetchFileUrlAndToken = async () => {
      try {
        const rawUrl = await downloadFile(file.filename);
        const formattedUrl = rawUrl.replace('http://localhost:3001', 'http://host.docker.internal:3001');

        dev ? setFileUrl(formattedUrl) : setFileUrl(rawUrl);

        const config = {
          document: {
            fileType,
            type,
            key: editorConfig.key,
            title: file.basename,
            url: dev ? formattedUrl : rawUrl,
            height: '100%',
            width: '100%',
          },
          documentType: editorConfig.documentType,
          editorConfig: {
            callbackUrl: `${window.location.origin}/edu-api/filemanager/callback/${file.filename}/${file.basename}/${user?.access_token}`,
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
    <div className={`relative ${isPreview ? 'h-[80vh]' : 'h-[100vh]'}`}>
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
          documentServerUrl={import.meta.env.VITE_ONLYOFFICE_URL as string}
          config={{
            document: {
              fileType: getFileType(file.filename),
              key: editorType.key,
              title: file.basename,
              url: fileUrl || '152',
            },
            documentType: editorType.documentType,
            token,
            editorConfig: {
              callbackUrl: `${window.location.origin}/edu-api/filemanager/callback/${file.filename}/${file.basename}/${user?.access_token}`,
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
