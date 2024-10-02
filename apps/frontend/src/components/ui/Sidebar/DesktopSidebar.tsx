import React, { useCallback, useEffect, useState, useRef } from 'react';
import { SidebarProps } from '@libs/ui/types/sidebar';
import { SIDEBAR_TRANSLATE_AMOUNT } from '@libs/ui/constants';
import { useWindowSize } from 'usehooks-ts';
import { SidebarItem, UserMenuButton, HomeButton, DownButton, UpButton } from './SidebarMenuItems';

const DesktopSidebar: React.FC<SidebarProps> = ({ sidebarItems }) => {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const size = useWindowSize();
  const [translate, setTranslate] = useState(0);
  const [isUpButtonVisible, setIsUpButtonVisible] = useState(false);
  const [isDownButtonVisible, setIsDownButtonVisible] = useState(false);
  const [startY, setStartY] = useState<number | null>(null);

  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();
      setTranslate((prevTranslate) => {
        if (sidebarRef.current == null) {
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
        if (sidebarRef.current == null) {
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
      if (sidebarRef.current == null) {
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

    if (sidebarRef.current === null) {
      setIsDownButtonVisible(true);
      return;
    }
    const rect = sidebarRef.current.getBoundingClientRect();

    setIsDownButtonVisible(rect.bottom > window.innerHeight - 58);
  }, [size, translate, sidebarItems, isDownButtonVisible, sidebarRef]);

  useEffect(() => {
    const container = sidebarRef.current;
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
    const container = sidebarRef.current;
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

  return (
    <div className="fixed right-0 z-[50] h-screen bg-black bg-opacity-90 md:bg-none">
      <HomeButton />
      {isUpButtonVisible ? <UpButton onClick={handleUpButtonClick} /> : null}

      <div
        ref={sidebarRef}
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
};

export default DesktopSidebar;
