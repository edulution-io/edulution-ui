import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
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
        <DialogTitle>{t('loadingIndicator.title')}</DialogTitle>
        <DialogHeader>
          <div className="flex flex-col items-center justify-center space-y-4">
            <CircleLoader />
            <p className="text-foreground">{t('loadingIndicator.message')}</p>
          </div>
        </DialogHeader>
        <DialogDescription />
      </DialogContent>
    </Dialog>
  );
};

export default LoadingIndicator;
