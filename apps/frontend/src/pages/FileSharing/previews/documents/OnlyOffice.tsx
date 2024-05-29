import React, { FC, useEffect, useState } from 'react';
import { DocumentEditor } from '@onlyoffice/document-editor-react';
import { DirectoryFile } from '@/datatypes/filesystem';
import useFileManagerStore from '@/pages/FileSharing/fileManagerStore';
import useFileEditorStore from './fileEditorStore';
import PreviewMenuBar from '@/pages/FileSharing/previews/documents/PreviewMenuBar.tsx';

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

    const fetchFileUrlAndToken = async () => {
      try {
        const rawUrl = await downloadFile(file.filename);
        setFileUrl(rawUrl);

        const config = {
          document: {
            fileType,
            type: type,
            key: editorConfig.key,
            title: file.basename,
            url: rawUrl,
            height: '100%',
            width: '100%',
          },
          documentType: editorConfig.documentType,
          editorConfig: {
            callbackUrl: 'https://ui.schulung.multi.schule/edu-api/filemanager/callback',
            mode: mode,
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
    <div className="relative h-[80vh]">
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
          documentServerUrl="https://office.schulung.multi.schule"
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
              callbackUrl: 'https://ui.schulung.multi.schule/edu-api/filemanager/callback',
              mode: mode,
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
