import React, { FC, useEffect, useState } from 'react';
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
  const { documentServerURL, editorType, isLoading, editorsConfig } = useOnlyOffice({
    filePath,
    fileName,
    url,
    type,
    mode,
  });

  const [localLoading, setLocalLoading] = useState(true);

  useEffect(() => {
    setLocalLoading(true);
    return () => {
      setLocalLoading(false);
    };
  }, [url, filePath, fileName, mode, type]);

  useEffect(() => {
    if (!isLoading && editorsConfig && editorType) {
      setLocalLoading(false);
    }
  }, [isLoading, editorsConfig, editorType]);

  if (localLoading || !editorsConfig) {
    return <div>Loading document...</div>;
  }

  return (
    <OnlyOfficeEditor
      documentServerURL={documentServerURL}
      editorType={editorType}
      mode={mode}
      editorConfig={editorsConfig}
      filePath={filePath}
      fileName={fileName}
    />
  );
};

export default OnlyOffice;
