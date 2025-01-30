import React from 'react';
import CircleLoader from '@/components/ui/CircleLoader';
import { t } from 'i18next';

const FileContentLoadingIndicator = () => (
  <div className="flex flex-col items-center justify-center space-y-4">
    <CircleLoader />
    <p className="text-background">{t('loadingIndicator.previewLoading')}</p>
  </div>
);

export default FileContentLoadingIndicator;
