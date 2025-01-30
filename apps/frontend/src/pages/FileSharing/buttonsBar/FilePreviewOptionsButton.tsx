import React, { FC, ReactNode } from 'react';
import { Button } from '@/components/shared/Button';

interface FilePreviewButtonsProps {
  onClick: () => void;
  icon?: ReactNode;
}

const FilePreviewOptionsButton: FC<FilePreviewButtonsProps> = ({ onClick, icon }) => (
  <Button
    variant="btn-small"
    className="hover:bg-grey-700 rounded bg-secondary p-1 text-background"
    onClick={onClick}
  >
    {icon && <span className="inline text-foreground">{icon}</span>}
  </Button>
);

export default FilePreviewOptionsButton;
