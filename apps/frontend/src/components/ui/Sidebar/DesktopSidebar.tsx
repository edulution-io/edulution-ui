import React, { MutableRefObject, forwardRef } from 'react';
import { SidebarProps } from '@libs/ui/types/sidebar';
import { SidebarItem, UserMenuButton, HomeButton, DownButton, UpButton } from './SidebarMenuItems';

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

    return (
      <div className="fixed right-0 z-[50] h-screen border-l-[1px] border-ciLightGrey bg-black bg-opacity-90 md:bg-none">
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
              isDesktop
            />
          ))}
        </div>
        {isDownButtonVisible ? <DownButton onClick={handleDownButtonClick} /> : null}
        <UserMenuButton />
      </div>
    );
  },
);

DesktopSidebar.displayName = 'DesktopSidebar';

export default DesktopSidebar;
