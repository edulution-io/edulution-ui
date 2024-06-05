import React, { MutableRefObject, forwardRef } from 'react';
import SidebarItem from './SidebarItem';
import UserMenuButton from './SidebarMenuButtons/UserMenuButton';
import HomeButton from './SidebarMenuButtons/HomeButton';
import DownButton from './SidebarMenuButtons/DownButton';
import UpButton from './SidebarMenuButtons/UpButton';
import { SidebarProps } from './sidebar';

const DesktopSidebar = forwardRef<HTMLDivElement, SidebarProps>(
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
    const sidebarIconsRef = ref as MutableRefObject<HTMLDivElement>;

    const renderListItem = () => (
      <div className="fixed right-0 h-screen border-l-[1px] border-ciLightGrey bg-black bg-opacity-90 md:bg-none">
        <HomeButton />
        {isUpButtonVisible ? <UpButton onClick={handleUpButtonClick} /> : null}

        <div
          ref={sidebarIconsRef}
          style={{ transform: `translateY(-${translate}px)`, overflowY: 'clip' }}
          onWheel={() => handleWheel}
          onTouchStart={() => handleTouchStart}
          onTouchMove={() => handleTouchMove}
          onTouchEnd={() => handleTouchEnd}
        >
          {sidebarItems.map((item) => (
            <SidebarItem
              key={item.link}
              menuItem={item}
              translate={translate}
            />
          ))}
        </div>
        {isDownButtonVisible ? <DownButton onClick={handleDownButtonClick} /> : null}
        <UserMenuButton />
      </div>
    );

    return renderListItem();
  },
);

DesktopSidebar.displayName = 'DesktopSidebar';

export default DesktopSidebar;
