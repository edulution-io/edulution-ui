import React, { useMemo } from 'react';
import { MdMenu } from 'react-icons/md';
import { IconContext } from 'react-icons';
import useSidebarStore from '../sidebarStore';

const MobileMenuButton: React.FC = () => {
  const { toggleMobileSidebar } = useSidebarStore();
  const iconContextValue = useMemo(() => ({ className: 'h-8 w-8' }), []);

  return (
    <button
      type="button"
      onClick={toggleMobileSidebar}
    >
      <IconContext.Provider value={iconContextValue}>
        <MdMenu />
      </IconContext.Provider>
    </button>
  );
};

export default MobileMenuButton;
