import React, { FC } from 'react';
import Label from '@/components/ui/label';
import { DirectoryFile } from '@/datatypes/filesystem';

interface PDFPreviewProps {
  file: DirectoryFile;
}

const PDFPreview: FC<PDFPreviewProps> = ({ file }) => (
  <div>
    <Label>PDF Preview for: {file.filename}</Label>
  </div>
);

export default PDFPreview;
