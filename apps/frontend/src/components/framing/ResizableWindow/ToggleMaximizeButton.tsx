import React from 'react';
import cn from '@libs/common/utils/className';

const ToggleMaximizeButton = ({
  handleMaximizeToggle,
  isMinimized,
  isMaximized,
}: {
  handleMaximizeToggle: () => void;
  isMinimized: boolean;
  isMaximized: boolean;
}) => (
  <button
    type="button"
    onClick={handleMaximizeToggle}
    className={cn('flex h-10 w-16 items-center justify-center p-5 text-sm hover:bg-gray-600', {
      'h-5 w-8': isMinimized,
    })}
  >
    <div className="mt-[-4px]">{isMaximized ? '🗗' : '🗖'}</div>
  </button>
);

export default ToggleMaximizeButton;
