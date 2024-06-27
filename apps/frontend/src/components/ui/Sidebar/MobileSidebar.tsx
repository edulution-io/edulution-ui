import React, { useRef } from 'react';
import { useOnClickOutside } from 'usehooks-ts';
import { SidebarProps } from '@libs/ui/types/sidebar';
import { UserMenuButton, HomeButton, MobileMenuButton, MobileSidebarItem } from './SidebarMenuItems';
import useSidebarStore from './sidebarStore';

const MobileSidebar: React.FC<SidebarProps> = ({ sidebarItems }) => {
  const sidebarRef = useRef(null);
  const { isMobileSidebarOpen, toggleMobileSidebar } = useSidebarStore();

  useOnClickOutside(sidebarRef, isMobileSidebarOpen ? toggleMobileSidebar : () => {});

  return (
    <>
      <MobileMenuButton />
      <div
        className="fixed right-0 top-0 z-[40] h-full w-full transform transition-transform duration-300 ease-in-out"
        style={{ transform: `translateX(${isMobileSidebarOpen ? '0' : '100%'})` }}
      >
        <div
          ref={sidebarRef}
          className="fixed right-0 h-screen border-l-[1px] border-ciLightGrey bg-black bg-opacity-90 md:bg-none"
        >
          <div className="relative right-0 top-0 h-14 bg-black pr-4 pt-4" />
          <div className="h-[calc(100%-56px)] overflow-auto">
            <HomeButton />
            {sidebarItems.map((item) => (
              <MobileSidebarItem
                key={item.link}
                menuItem={item}
              />
            ))}
            <UserMenuButton />
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileSidebar;
