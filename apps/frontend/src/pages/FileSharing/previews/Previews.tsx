import React, { FC } from 'react';
import { DirectoryFile } from '@/datatypes/filesystem.ts';
import OnlyOffice from './documents/OnlyOffice';
import GraphicPreview from '@/pages/FileSharing/previews/graphics/GraphicPreview.tsx';

import { t } from 'i18next';
import { determinePreviewType } from '@/pages/FileSharing/previews/utilitys/utilitys.ts';
import MediaPreview from '@/pages/FileSharing/previews/media/MediaPreview.tsx';
import DiagramPreview from '@/pages/FileSharing/previews/diagrams/DiagramPreview.tsx';

interface PreviewsProps {
  file: DirectoryFile;
  onClose: () => void;
  isPreview: boolean;
  type: 'desktop' | 'mobile';
  mode: 'edit' | 'view';
}

const Previews: FC<PreviewsProps> = ({ file, onClose, isPreview, type, mode }) => {
  const previewType = determinePreviewType(file);

  switch (previewType) {
    case 'office':
      return (
        <OnlyOffice
          type={type}
          file={file}
          mode={mode}
          onClose={onClose}
          isPreview={isPreview}
        />
      );
    case 'image':
      return (
        <GraphicPreview
          file={file}
          onClose={onClose}
          isPreview={isPreview}
        />
      );
    case 'media':
      return (
        <MediaPreview
          file={file}
          onClose={onClose}
          isPreview={isPreview}
        />
      );
    case 'diagram':
      return (
        <DiagramPreview
          file={file}
          onClose={onClose}
          isPreview={isPreview}
        />
      );
    default:
      return <h1>{t('fileEditingPage.fileNotFound')}</h1>;
  }
};

export default Previews;
