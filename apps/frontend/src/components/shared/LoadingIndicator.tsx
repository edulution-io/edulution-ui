import React from 'react';
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';
import CircleLoader from '@/components/ui/circleLoader';

interface LoadingIndicatorProps {
  isOpen: boolean;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ isOpen }) => (
  <Dialog open={isOpen}>
    <DialogContent showCloseButton={false}>
      <DialogHeader>
        <div className="flex flex-col items-center justify-center space-y-4">
          <CircleLoader />
          <p>Please wait while we process your request...</p>
        </div>
      </DialogHeader>
    </DialogContent>
  </Dialog>
);
export default LoadingIndicator;
