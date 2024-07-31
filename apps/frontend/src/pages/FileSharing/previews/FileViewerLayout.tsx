import FilePreviewOptionsBar from '@/pages/FileSharing/buttonsBar/FilePreviewOptionsBar';
import React, { FC, ReactNode } from 'react';

interface FileViewerLayoutProps {
  isLoading: boolean;
  renderComponent: () => ReactNode;
}

const FileViewerLayout: FC<FileViewerLayoutProps> = ({ isLoading, renderComponent }) => (
  <div className="flex w-full flex-row">
    {!isLoading && <FilePreviewOptionsBar />}
    <div className="flex-grow">{renderComponent()}</div>
    {!isLoading && <FilePreviewOptionsBar />}
  </div>
);

export default FileViewerLayout;
