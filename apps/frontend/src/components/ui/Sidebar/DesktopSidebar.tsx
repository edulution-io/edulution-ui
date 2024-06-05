import React, { MutableRefObject, forwardRef, useCallback, useEffect, useState } from 'react';
import { useWindowSize } from 'usehooks-ts';
import { SIDEBAR_TRANSLATE_AMOUNT } from '@/constants/style';
import SidebarItem from './SidebarItem';
import UserMenuButton from './SidebarMenuButtons/UserMenuButton';
import HomeButton from './SidebarMenuButtons/HomeButton';
import DownButton from './SidebarMenuButtons/DownButton';
import UpButton from './SidebarMenuButtons/UpButton';
import { SidebarMenuItem } from './sidebar';

interface DesktopSidebarProps {
  sidebarItems: SidebarMenuItem[];
}

const DesktopSidebar = forwardRef<HTMLDivElement, DesktopSidebarProps>(({ sidebarItems }, ref) => {
  const [translate, setTranslate] = useState(0);
  const [isUpButtonVisible, setIsUpButtonVisible] = useState(false);
  const [isDownButtonVisible, setIsDownButtonVisible] = useState(false);
  const size = useWindowSize();
  const [startY, setStartY] = useState<number | null>(null);
  const sidebarIconsRef = ref as MutableRefObject<HTMLDivElement>;

  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();
      setTranslate((prevTranslate) => {
        if (sidebarIconsRef.current == null) {
          return prevTranslate;
        }
        if (isDownButtonVisible && e.deltaY > 0) {
          return prevTranslate + SIDEBAR_TRANSLATE_AMOUNT;
        }
        if (isUpButtonVisible && e.deltaY < 0 && translate > 0) {
          return prevTranslate - SIDEBAR_TRANSLATE_AMOUNT;
        }
        return prevTranslate;
      });
    },
    [isDownButtonVisible, isUpButtonVisible, translate],
  );

  const handleTouchStart = useCallback(
    (event: TouchEvent) => {
      setStartY(event.touches[0].clientY);
    },
    [isDownButtonVisible, isUpButtonVisible, translate, startY],
  );

  const handleTouchMove = useCallback(
    (event: TouchEvent) => {
      event.preventDefault();
      if (!startY) return;

      const deltaY = startY - event.touches[0].clientY;

      setTranslate((prevTranslate) => {
        if (sidebarIconsRef.current == null) {
          return prevTranslate;
        }
        if (isUpButtonVisible && deltaY > 0 && translate > 0) return prevTranslate - 53 / 3;
        if (isDownButtonVisible && deltaY < 0) return prevTranslate + 53 / 3;
        return prevTranslate;
      });
    },
    [isDownButtonVisible, isUpButtonVisible, startY, translate],
  );

  const handleTouchEnd = useCallback(() => {
    setStartY(null);
  }, [isDownButtonVisible, isUpButtonVisible, translate, startY]);

  const handleUpButtonClick = () => {
    setTranslate((prevTranslate) => {
      const newTranslate = prevTranslate - SIDEBAR_TRANSLATE_AMOUNT;
      if (newTranslate <= 0) return 0;
      return newTranslate;
    });
  };

  const handleDownButtonClick = () => {
    setTranslate((prevTranslate) => {
      if (sidebarIconsRef.current == null) {
        return prevTranslate;
      }

      const newTranslate = prevTranslate + SIDEBAR_TRANSLATE_AMOUNT;
      return newTranslate;
    });
  };

  useEffect(() => {
    if (!isUpButtonVisible) {
      setTranslate(0);
    }
  }, [size, isUpButtonVisible]);

  useEffect(() => {
    setIsUpButtonVisible(translate > 0);

    if (sidebarIconsRef.current == null) return;

    const rect = sidebarIconsRef.current.getBoundingClientRect();

    setIsDownButtonVisible(rect.bottom > window.innerHeight - 58);
  }, [size, translate, sidebarItems]);

  useEffect(() => {
    const container = sidebarIconsRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
    }

    return () => {
      if (container) {
        container.removeEventListener('wheel', handleWheel);
      }
    };
  }, [handleWheel]);

  useEffect(() => {
    const container = sidebarIconsRef.current;
    if (container) {
      container.addEventListener('touchmove', handleTouchMove, { passive: false });
      container.addEventListener('touchstart', handleTouchStart, { passive: false });
      container.addEventListener('touchend', handleTouchEnd, { passive: false });
    }

    return () => {
      if (container) {
        container.removeEventListener('touchmove', handleTouchMove);
        container.removeEventListener('touchstart', handleTouchStart);
        container.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

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
});

DesktopSidebar.displayName = 'DesktopSidebar';

export default DesktopSidebar;
