import React, { MutableRefObject, forwardRef, useRef } from 'react';
import { useOnClickOutside, useToggle } from 'usehooks-ts';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/shared/Button';
import UserMenuButton from './SidebarMenuButtons/UserMenuButton';
import HomeButton from './SidebarMenuButtons/HomeButton';
import SidebarItem from './SidebarItem';
import DownButton from './SidebarMenuButtons/DownButton';
import UpButton from './SidebarMenuButtons/UpButton';
import { SidebarProps } from './sidebar';

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
    const { t } = useTranslation();
    const [isOpen, toggle] = useToggle();

    useOnClickOutside(sidebarRef, isOpen ? toggle : () => {});

    const sidebarClasses = `fixed top-0 right-0 z-40 h-full w-64 transform transition-transform duration-300 ease-in-out ${
      isOpen ? 'translate-x-0' : 'translate-x-full'
    }`;

    const menuButton = () => (
      <Button
        variant="btn-outline"
        size="sm"
        className="rounded-xl border-[3px] bg-black"
        onClick={toggle}
      >
        {t('menu')}
      </Button>
    );

    const renderListItem = () => (
      <div className="fixed right-0 h-screen border-l-[1px] border-ciLightGrey bg-black bg-opacity-90 md:bg-none">
        {isOpen ? (
          <>
            <div className="relative right-0 top-0 z-[98] h-[100px] bg-black" />
            <div className="fixed right-0 top-0 z-[99] pr-4 pt-4">{menuButton()}</div>
          </>
        ) : null}
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
            <SidebarItem
              key={item.link}
              menuItem={item}
              isDesktop={false}
              translate={translate}
            />
          ))}
          <UserMenuButton />
        </div>
        {isDownButtonVisible ? <DownButton onClick={handleDownButtonClick} /> : null}
      </div>
    );

    return (
      <>
        {!isOpen ? <div className="fixed right-0 top-0 z-[55] pr-4 pt-4">{menuButton()}</div> : null}
        <div
          ref={sidebarRef}
          className={`${sidebarClasses}`}
        >
          <div className="">{isOpen && renderListItem()}</div>
        </div>
      </>
    );
  },
);

MobileSidebar.displayName = 'MobileSidebar';

export default MobileSidebar;
