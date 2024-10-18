import React, { FC, ReactNode } from 'react';
import { Button } from '@/components/shared/Button';

interface FilePreviewButtonsProps {
  onClick: () => void;
  icon?: ReactNode;
}

const FilePreviewOptionsButton: FC<FilePreviewButtonsProps> = ({ onClick, icon }) => (
  <Button
    variant="btn-small"
    className="hover:bg-grey-700 rounded bg-ciLightGrey bg-white p-1 text-white"
    onClick={onClick}
  >
    {icon && <span className="inline text-black">{icon}</span>}
  </Button>
);

export default FilePreviewOptionsButton;
