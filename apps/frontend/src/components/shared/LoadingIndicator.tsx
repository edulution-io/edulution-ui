import React from 'react';
import { useTranslation } from 'react-i18next';
import { DialogSH, DialogContentSH, DialogHeaderSH } from '@/components/ui/DialogSH';
import CircleLoader from '@/components/ui/CircleLoader';

interface LoadingIndicatorProps {
  isOpen: boolean;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ isOpen }) => {
  const { t } = useTranslation();

  return (
    <DialogSH open={isOpen}>
      <DialogContentSH showCloseButton={false}>
        <DialogHeaderSH>
          <div className="flex flex-col items-center justify-center space-y-4">
            <CircleLoader />
            <p className="text-black">{t('loadingIndicator.message')}</p>
          </div>
        </DialogHeaderSH>
      </DialogContentSH>
    </DialogSH>
  );
};

export default LoadingIndicator;
