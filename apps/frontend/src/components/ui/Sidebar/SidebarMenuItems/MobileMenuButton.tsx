import React, { useMemo } from 'react';
import { MdMenu } from 'react-icons/md';
import { IconContext } from 'react-icons';
import useSidebarStore from '../sidebarStore';

const MobileMenuButton: React.FC = () => {
  const { toggleMobileSidebar } = useSidebarStore();
  const iconContextValue = useMemo(() => ({ className: 'h-8 w-8' }), []);

  return (
    <div className="fixed right-0 top-0 z-[999] pr-4 pt-4">
      <button
        type="button"
        onClickCapture={toggleMobileSidebar}
      >
        <IconContext.Provider value={iconContextValue}>
          <MdMenu />
        </IconContext.Provider>
      </button>
    </div>
  );
};

export default MobileMenuButton;
