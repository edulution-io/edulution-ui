import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import CircleLoader from '@/components/ui/CircleLoader';

interface LoadingIndicatorProps {
  isOpen: boolean;
  id?: string;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ isOpen, id }) => (
  <Dialog open={isOpen}>
    <DialogContent
      id={id} // Assign the id here
      showCloseButton={false}
      variant="loadingSpinner"
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
