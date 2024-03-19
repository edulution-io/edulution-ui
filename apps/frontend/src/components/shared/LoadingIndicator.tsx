import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader } from '@/components/ui/dialog';
import CircleLoader from '@/components/ui/circleLoader';
import { useTranslation } from 'react-i18next';

interface LoadingIndicatorProps {
  isOpen: boolean;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ isOpen }) => {
  const { t } = useTranslation();

  return (
    <Dialog open={isOpen}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogDescription>
            <div className="flex flex-col items-center justify-center space-y-4">
              <CircleLoader />
              <p className="text-black">{t('loadingIndicator.message')}</p>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default LoadingIndicator;
