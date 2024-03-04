import { FileTypePreviewProps } from '@/datatypes/types';
import PDFPreview from '@/pages/FileSharing/previews/pdf/PDFPreview';
import React from 'react';
import MediaPreview from '@/pages/FileSharing/previews/media/MediaPreview';
import GraphicPreview from '@/pages/FileSharing/previews/graphics/GraphicPreview';
import OnlyOffice from '@/pages/FileSharing/previews/documents/OnlyOffice';

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
  docx: OnlyOffice,
  xlsx: OnlyOffice,
  pptx: OnlyOffice,
};

export default fileTypePreviews;
