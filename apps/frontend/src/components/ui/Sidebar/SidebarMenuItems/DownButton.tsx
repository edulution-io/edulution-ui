import React, { useMemo } from 'react';
import { IconContext } from 'react-icons';
import { MdArrowDropDown } from 'react-icons/md';
import { SidebarArrowButtonProps } from '@libs/ui/types/sidebar/sidebarArrowButtonProps';

const DownButton: React.FC<SidebarArrowButtonProps> = ({ onClick }) => {
  const iconContextValue = useMemo(() => ({ className: 'h-8 w-8' }), []);

  return (
    <div key="down">
      <button
        type="button"
        className="absolute bottom-[58px] right-0 z-[99] w-full cursor-pointer items-center justify-end border-y-2 border-ciLightGrey bg-black px-4 py-2 hover:bg-stone-900 md:block md:px-2"
        onClick={onClick}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <IconContext.Provider value={iconContextValue}>
            <MdArrowDropDown />
          </IconContext.Provider>
        </div>
      </button>
    </div>
  );
};

export default DownButton;
