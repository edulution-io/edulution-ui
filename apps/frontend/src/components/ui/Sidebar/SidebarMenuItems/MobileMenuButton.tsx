import React, { useMemo, forwardRef } from 'react';
import { MdMenu } from 'react-icons/md';
import { IconContext } from 'react-icons';
import useSidebarStore from '../sidebarStore';

const MobileMenuButton = forwardRef<HTMLButtonElement>((_props, ref) => {
  const { isMobileSidebarOpen, toggleMobileSidebar } = useSidebarStore();
  const iconContextValue = useMemo(() => ({ className: 'h-8 w-8' }), []);

  return (
    <div
      className={`fixed right-0 top-0 z-[50] h-fit transform pr-4 pt-4 transition-transform ease-in-out ${
        isMobileSidebarOpen ? 'translate-x-[-200px] duration-300' : 'translate-x-0 duration-200'
      }`}
    >
      <button
        type="button"
        onClick={toggleMobileSidebar}
        ref={ref}
        className="rounded-md border-2 border-black border-opacity-10 bg-black bg-opacity-50"
      >
        <IconContext.Provider value={iconContextValue}>
          <MdMenu />
        </IconContext.Provider>
      </button>
    </div>
  );
});

MobileMenuButton.displayName = 'MobileMenuButton';

export default MobileMenuButton;
