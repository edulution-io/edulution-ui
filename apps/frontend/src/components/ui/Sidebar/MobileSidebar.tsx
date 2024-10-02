import React, { useRef, useCallback } from 'react';
import { useOnClickOutside } from 'usehooks-ts';
import { SidebarProps } from '@libs/ui/types/sidebar';
import { UserMenuButton, HomeButton, MobileMenuButton, MobileSidebarItem } from './SidebarMenuItems';
import useSidebarStore from './sidebarStore';

const MobileSidebar: React.FC<SidebarProps> = ({ sidebarItems }) => {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { isMobileSidebarOpen, toggleMobileSidebar } = useSidebarStore();

  const handleClickOutside = useCallback(
    (event: MouseEvent | TouchEvent) => {
      const isSidebarRef = sidebarRef.current && !sidebarRef.current.contains(event.target as Node);
      const isButtonRef = buttonRef.current && !buttonRef.current.contains(event.target as Node);
      if (isMobileSidebarOpen && isSidebarRef && isButtonRef) {
        toggleMobileSidebar();
      }
    },
    [isMobileSidebarOpen, toggleMobileSidebar],
  );

  useOnClickOutside(sidebarRef, handleClickOutside);

  return (
    <>
      <MobileMenuButton ref={buttonRef} />
      <div
        className="fixed right-0 top-0 z-[40] h-full w-full transform transition-transform duration-300 ease-in-out"
        style={{ transform: `translateX(${isMobileSidebarOpen ? '0%' : '100%'})` }}
      >
        <div
          ref={sidebarRef}
          className="fixed right-0 h-full min-w-[260px] border-l-[1px] border-ciGrey bg-black bg-opacity-90 md:bg-none"
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
