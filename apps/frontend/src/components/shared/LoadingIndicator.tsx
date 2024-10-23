import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import CircleLoader from '@/components/ui/CircleLoader';

interface LoadingIndicatorProps {
  isOpen: boolean;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ isOpen }) => (
  <Dialog open={isOpen}>
    <DialogContent
      showCloseButton={false}
      variant="primary"
    >
      <DialogTitle aria-disabled />
      <DialogHeader>
        <div className="flex flex-col items-center justify-center space-y-4">
          <CircleLoader />
        </div>
      </DialogHeader>
      <DialogDescription aria-disabled />
    </DialogContent>
  </Dialog>
);

export default LoadingIndicator;
