import { FileTypePreviewProps } from '@/datatypes/types';
import PDFPreview from '@/pages/FileSharing/previews/pdf/PDFPreview';
import React from 'react';
import MediaPreview from '@/pages/FileSharing/previews/media/MediaPreview';

export interface FileTypeComponentMap {
  [key: string]: React.ComponentType<FileTypePreviewProps>;
}

const fileTypePreviews: FileTypeComponentMap = {
  pdf: PDFPreview,
  mp3: MediaPreview,
  mp4: MediaPreview,
  mov: MediaPreview,
};

export default fileTypePreviews;
