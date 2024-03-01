import { FileTypePreviewProps } from '@/datatypes/types';
import PDFPreview from './PDFPreview';

export interface FileTypeComponentMap {
  [key: string]: React.ComponentType<FileTypePreviewProps>;
}

const fileTypePreviews: FileTypeComponentMap = {
  pdf: PDFPreview,
};

export default fileTypePreviews;
