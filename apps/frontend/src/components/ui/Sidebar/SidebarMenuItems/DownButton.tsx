import React, { useMemo } from 'react';
import { IconContext } from 'react-icons';
import { MdArrowDropDown } from 'react-icons/md';
import useIsMobileView from '@/hooks/useIsMobileView';

type DownButtonProps = {
  onClick: () => void;
};

const DownButton: React.FC<DownButtonProps> = ({ onClick }) => {
  const isMobileView = useIsMobileView();
  const iconContextValue = useMemo(() => ({ className: 'h-8 w-8' }), []);

  return (
    <div key="down">
      <button
        type="button"
        className={`absolute right-0 z-[99] w-full cursor-pointer items-center justify-end border-y-2 border-ciLightGrey bg-black px-4 py-2 hover:bg-stone-900 md:block md:px-2 ${isMobileView ? 'bottom-0 h-[58px] border-t-0' : 'bottom-[58px]'}`}
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
