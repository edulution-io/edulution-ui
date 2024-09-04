import React from 'react';
import { MdClose, MdMaximize, MdMinimize } from 'react-icons/md';
import cn from '@/lib/utils';

interface ControlPanelProps {
  isMobileView: boolean;
  isMinimized?: boolean;
  toggleMinimized?: () => void;
  onClose: () => void;
  minimizeLabel?: string;
  maximizeLabel?: string;
  closeLabel?: string;
  showMinimize?: boolean;
  showClose?: boolean;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  isMobileView,
  isMinimized,
  toggleMinimized,
  onClose,
  minimizeLabel = 'Minimize',
  maximizeLabel = 'Maximize',
  closeLabel = 'Close',
  showMinimize = true,
  showClose = true,
}) => (
  <div
    className={cn(
      'fixed -top-1 left-1/2 z-10 -translate-x-1/2 transform',
      isMobileView && 'flex items-center space-x-4',
    )}
  >
    {showMinimize && (
      <button
        type="button"
        className="mr-1 rounded bg-blue-500 px-4 text-white hover:bg-blue-700"
        onClick={toggleMinimized}
      >
        {isMinimized ? <MdMaximize className="inline" /> : <MdMinimize className="inline" />}{' '}
        {/* eslint-disable-next-line no-nested-ternary */}
        {isMobileView ? '' : isMinimized ? maximizeLabel : minimizeLabel}
      </button>
    )}
    {showClose && (
      <button
        type="button"
        className="rounded bg-ciLightRed px-4 text-white hover:bg-ciRed"
        onClick={onClose}
      >
        <MdClose className="inline" /> {isMobileView ? '' : closeLabel}
      </button>
    )}
  </div>
);

export default ControlPanel;
