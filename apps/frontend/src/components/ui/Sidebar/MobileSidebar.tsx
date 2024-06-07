import React, { MutableRefObject, forwardRef, useRef } from 'react';
import { useOnClickOutside } from 'usehooks-ts';

import UserMenuButton from './SidebarMenuButtons/UserMenuButton';
import HomeButton from './SidebarMenuButtons/HomeButton';
import DownButton from './SidebarMenuButtons/DownButton';
import UpButton from './SidebarMenuButtons/UpButton';
import { SidebarProps } from './sidebar';
import useSidebarStore from './sidebarStore';
import MobileMenuButton from './SidebarMenuButtons/MobileMenuButton';
import MobileSidebarItem from './MobileSidebarItem';

const MobileSidebar = forwardRef<HTMLDivElement, SidebarProps>(
  (
    {
      translate,
      isUpButtonVisible,
      isDownButtonVisible,
      sidebarItems,
      handleUpButtonClick,
      handleDownButtonClick,
      handleWheel,
      handleTouchStart,
      handleTouchMove,
      handleTouchEnd,
    },
    ref,
  ) => {
    const sidebarRef = useRef<HTMLDivElement>(null);
    const sidebarIconsRef = ref as MutableRefObject<HTMLDivElement>;
    const { isMobileSidebarOpen, toggleMobileSidebar } = useSidebarStore();

    useOnClickOutside(sidebarRef, isMobileSidebarOpen ? toggleMobileSidebar : () => {});

    const renderMobileSidebar = () => (
      <div className="fixed right-0 h-screen border-l-[1px] border-ciLightGrey bg-black bg-opacity-90 md:bg-none">
        <div className="relative right-0 top-0 z-[99] h-[58px] bg-black pr-4 pt-4" />
        <HomeButton />
        {isUpButtonVisible ? <UpButton onClick={handleUpButtonClick} /> : null}

        <div
          ref={sidebarIconsRef}
          style={{ transform: `translateY(-${translate}px)` }}
          onWheel={() => handleWheel}
          onTouchStart={() => handleTouchStart}
          onTouchMove={() => handleTouchMove}
          onTouchEnd={() => handleTouchEnd}
        >
          {sidebarItems.map((item) => (
            <MobileSidebarItem
              key={item.link}
              menuItem={item}
            />
          ))}
          <UserMenuButton />
        </div>
        {isDownButtonVisible ? <DownButton onClick={handleDownButtonClick} /> : null}
      </div>
    );

    return (
      <>
        <div
          className="fixed right-0 top-0 z-[40] h-full w-full transform transition-transform duration-300 ease-in-out"
          style={{ transform: `translateX(${isMobileSidebarOpen ? '0' : '100%'})` }}
        >
          {renderMobileSidebar()}
        </div>
        <div className="fixed right-0 top-0 z-[40] transform pr-4 pt-4 transition-transform duration-300">
          <MobileMenuButton />
        </div>
      </>
    );
  },
);

MobileSidebar.displayName = 'MobileSidebar';

export default MobileSidebar;
