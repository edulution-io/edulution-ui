import React, { useMemo } from 'react';
import cn from '@libs/common/utils/className';
import { BiWindow, BiWindows } from 'react-icons/bi';
import { IconContext } from 'react-icons';

const ToggleMaximizeButton = ({
  handleMaximizeToggle,
  isMinimized,
  isMaximized,
}: {
  handleMaximizeToggle: () => void;
  isMinimized: boolean;
  isMaximized: boolean;
}) => {
  const iconContextValue = useMemo(() => ({ className: 'h-4 w-4' }), []);

  return (
    <button
      type="button"
      onClick={handleMaximizeToggle}
      className={cn('flex h-10 w-16 items-center justify-center p-5 text-sm hover:bg-gray-600', {
        'h-5 w-8 px-0': isMinimized,
      })}
    >
      <IconContext.Provider value={iconContextValue}>{isMaximized ? <BiWindows /> : <BiWindow />}</IconContext.Provider>
    </button>
  );
};

export default ToggleMaximizeButton;
