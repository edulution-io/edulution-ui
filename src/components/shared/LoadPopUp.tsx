import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader } from '@/components/ui/dialog';
import CircleLoader from '@/components/ui/circleLoader';

interface LoadPopUpProps {
  isOpen: boolean;
}

const LoadPopUp: React.FC<LoadPopUpProps> = ({ isOpen }) => (
  <Dialog open={isOpen}>
    <DialogContent showCloseButton={false}>
      <DialogHeader>
        <DialogDescription>
          <div className="flex flex-col items-center justify-center space-y-4">
            <CircleLoader />
            <p>Please wait while we process your request...</p>
          </div>
        </DialogDescription>
      </DialogHeader>
    </DialogContent>
  </Dialog>
);
export default LoadPopUp;
