/*
 * LICENSE
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { SidebarProps } from '@libs/ui/types/sidebar';
import { SIDEBAR_TRANSLATE_AMOUNT } from '@libs/ui/constants';
import { useWindowSize } from 'usehooks-ts';
import { DownButton, HomeButton, SidebarItem, UpButton, UserMenuButton } from './SidebarMenuItems';

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

      return prevTranslate + SIDEBAR_TRANSLATE_AMOUNT;
    });
  };

  useEffect(() => {
    if (isUpButtonVisible && !isDownButtonVisible) {
      setTranslate(0);
    }
  }, [size.height]);

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
    const controller = new AbortController();
    const { signal } = controller;

    if (container) {
      container.addEventListener('touchmove', handleTouchMove, { passive: false, signal });
      container.addEventListener('touchstart', handleTouchStart, { passive: false, signal });
      container.addEventListener('touchend', handleTouchEnd, { passive: false, signal });
    }

    return () => {
      controller.abort();
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return (
    <div className="relative h-screen w-[var(--sidebar-width)]">
      <div className="fixed right-0 z-[600] h-full bg-black md:bg-none">
        <HomeButton />
        <div>
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
                isUpButtonVisible={isUpButtonVisible}
                isDownButtonVisible={isDownButtonVisible}
              />
            ))}
          </div>
          {isDownButtonVisible ? <DownButton onClick={handleDownButtonClick} /> : null}
        </div>
        <UserMenuButton />
      </div>
    </div>
  );
};

export default DesktopSidebar;
