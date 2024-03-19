import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader } from '@/components/ui/Dialog';
import CircleLoader from "@/components/ui/CircleLoader";


interface LoadingIndicatorProps {
  isOpen: boolean;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ isOpen }) => (
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
export default LoadingIndicator;
