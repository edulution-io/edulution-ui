import React, { FC } from 'react';
import OnlyOfficeEditor from '@/pages/FileSharing/previews/onlyOffice/OnlyOfficeEditor';
import useOnlyOffice from '@/pages/FileSharing/hooks/useOnlyOffice';

interface OnlyOfficeProps {
  filePath: string;
  fileName: string;
  url: string;
  type: 'desktop' | 'mobile';
  mode: 'view' | 'edit';
}

const OnlyOffice: FC<OnlyOfficeProps> = ({ url, filePath, fileName, mode, type }) => {
  const { documentServerURL, editorType, editorConfig } = useOnlyOffice({
    filePath,
    fileName,
    url,
    type,
    mode,
  });

  return (
    editorConfig && (
      <OnlyOfficeEditor
        documentServerURL={documentServerURL || ''}
        editorType={editorType}
        mode={mode}
        editorConfig={editorConfig}
        filePath={filePath}
        fileName={fileName}
      />
    )
  );
};

export default OnlyOffice;
