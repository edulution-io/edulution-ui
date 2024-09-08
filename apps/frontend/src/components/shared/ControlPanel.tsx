import React from 'react';
import { MdClose, MdMaximize, MdMinimize } from 'react-icons/md';
import cn from '@/lib/utils';
import useIsMobileView from '@/hooks/useIsMobileView';

interface ControlPanelProps {
  isMinimized?: boolean;
  toggleMinimized?: () => void;
  onClose: () => void;
  showMinimize?: boolean;
  showClose?: boolean;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  isMinimized,
  toggleMinimized,
  onClose,
  showMinimize = true,
  showClose = true,
}) => {
  const isMobileView = useIsMobileView();
  return (
    <div
      className={cn(
        'fixed -top-0.5 left-1/2 z-10 -translate-x-1/2 transform items-center',
        isMobileView && 'flex items-center space-x-4',
      )}
    >
      {showMinimize && (
        <button
          type="button"
          className="mr-1 rounded border-4 bg-black px-2 py-1 text-sm text-white border-ciGreenToBlue hover:bg-blue-700"
          onClick={toggleMinimized}
        >
          {isMinimized ? (
            <MdMaximize className="inline bg-ciLightGrey" />
          ) : (
            <MdMinimize className="inline text-ciLightGrey" />
          )}
        </button>
      )}
      {showClose && (
        <button
          type="button"
          className="mr-1 rounded border-4 bg-black px-2 py-1 text-sm text-white border-ciGreenToBlue   hover:bg-ciRed"
          onClick={onClose}
        >
          <MdClose className="bg-ciLightGre inline" />
        </button>
      )}
    </div>
  );
};
export default ControlPanel;
