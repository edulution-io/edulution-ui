import React from 'react';
import { MdClose, MdMaximize, MdMinimize } from 'react-icons/md';
import cn from '@/lib/utils';

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
}) => (
  <div
    className={cn(
      'fixed right-0 top-1 z-10 mr-2 flex items-center space-x-2', // Reduced space between buttons
    )}
  >
    {showMinimize && (
      <button
        type="button"
        className="mr-1 rounded bg-ciLightGrey px-2 py-1 text-sm text-white hover:bg-blue-700" // Smaller padding and text
        onClick={toggleMinimized}
      >
        {isMinimized ? <MdMaximize className="inline  bg-black" /> : <MdMinimize className="inline text-black" />}
      </button>
    )}
    {showClose && (
      <button
        type="button"
        className="rounded bg-ciLightGrey px-2 py-1 text-sm text-white hover:bg-ciRed" // Smaller padding and text
        onClick={onClose}
      >
        <MdClose className="inline text-black" />
      </button>
    )}
  </div>
);

export default ControlPanel;
