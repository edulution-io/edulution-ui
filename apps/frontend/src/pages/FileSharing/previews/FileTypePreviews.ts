import { FileTypePreviewProps } from '@/datatypes/types';
import PDFPreview from '@/pages/FileSharing/previews/pdf/PDFPreview';
import React from 'react';
import MediaPreview from '@/pages/FileSharing/previews/media/MediaPreview';
import GraphicPreview from '@/pages/FileSharing/previews/graphics/GraphicPreview';

export interface FileTypeComponentMap {
  [key: string]: React.ComponentType<FileTypePreviewProps>;
}

const fileTypePreviews: FileTypeComponentMap = {
  pdf: PDFPreview,
  mp3: MediaPreview,
  mp4: MediaPreview,
  mov: MediaPreview,
  jpg: GraphicPreview,
  jpeg: GraphicPreview,
  png: GraphicPreview,
};

export default fileTypePreviews;
