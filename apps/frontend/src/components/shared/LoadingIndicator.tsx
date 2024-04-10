import React from 'react';
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/Dialog';
import { useTranslation } from 'react-i18next';
import CircleLoader from '@/components/ui/CircleLoader';

interface LoadingIndicatorProps {
  isOpen: boolean;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ isOpen }) => {
  const { t } = useTranslation();

  return (
    <Dialog open={isOpen}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <div className="flex flex-col items-center justify-center space-y-4">
            <CircleLoader />
            <p className="text-black">{t('loadingIndicator.message')}</p>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default LoadingIndicator;
