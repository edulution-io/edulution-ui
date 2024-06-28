import React, { useMemo } from 'react';
import { IconContext } from 'react-icons';
import { MdArrowDropUp } from 'react-icons/md';
import useIsMobileView from '@/hooks/useIsMobileView';
import { SidebarArrowButtonProps } from '@libs/ui/types/sidebar/sidebarArrowButtonProps';

const UpButton: React.FC<SidebarArrowButtonProps> = ({ onClick }) => {
  const isMobileView = useIsMobileView();
  const iconContextValue = useMemo(() => ({ className: 'h-8 w-8' }), []);

  return (
    <div key="up">
      <button
        type="button"
        className={`relative right-0 z-[50] w-full cursor-pointer border-b-2 border-ciLightGrey bg-black px-4 py-2 hover:bg-stone-900 md:block md:px-2 ${isMobileView ? 'top-0 h-[58px] border-t-2' : ''}`}
        onClick={onClick}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <IconContext.Provider value={iconContextValue}>
            <MdArrowDropUp />
          </IconContext.Provider>
        </div>
      </button>
    </div>
  );
};

export default UpButton;
