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

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { SidebarProps } from '@libs/ui/types/sidebar';
import { SIDEBAR_TRANSLATE_AMOUNT } from '@libs/ui/constants';
import { useWindowSize } from 'usehooks-ts';
import { useLocation } from 'react-router-dom';
import SidebarArrowButton from '@/components/ui/Sidebar/SidebarMenuItems/SidebarArrowButton';
import { SIDEBAR_ARROW_BUTTON_HEIGHT } from '@libs/ui/constants/sidebar';
import { HomeButton, SidebarItem, UserMenuButton } from './SidebarMenuItems';

const DesktopSidebar: React.FC<SidebarProps> = ({ sidebarItems }) => {
  const appsRef = useRef<HTMLDivElement>(null);
  const appsContainerRef = useRef<HTMLDivElement>(null);
  const size = useWindowSize();
  const { pathname } = useLocation();
  const [translate, setTranslate] = useState(0);
  const [isUpButtonVisible, setIsUpButtonVisible] = useState(false);
  const [isDownButtonVisible, setIsDownButtonVisible] = useState(false);
  const [startY, setStartY] = useState<number | null>(null);

  const clampTranslateToPositiveValue = (value: number) => {
    const appsElement = appsRef.current;
    const appsContainerElement = appsContainerRef.current;

    if (!appsElement || !appsContainerElement) return Math.max(0, value);

    const maxTranslate = Math.max(
      0,
      appsElement.scrollHeight - appsContainerElement.clientHeight + SIDEBAR_ARROW_BUTTON_HEIGHT,
    );

    return Math.min(Math.max(0, value), maxTranslate);
  };

  const handleWheel = useCallback((event: WheelEvent) => {
    event.preventDefault();
    setTranslate((prev) => {
      const appsEl = appsRef.current;
      const containerEl = appsContainerRef.current;
      if (!appsEl || !containerEl) return prev;

      const maxTranslate = Math.max(0, appsEl.scrollHeight - containerEl.clientHeight + SIDEBAR_ARROW_BUTTON_HEIGHT);

      let next = prev;
      if (event.deltaY > 0 && prev < maxTranslate) {
        next = prev + SIDEBAR_TRANSLATE_AMOUNT;
      } else if (event.deltaY < 0 && prev > 0) {
        next = prev - SIDEBAR_TRANSLATE_AMOUNT;
      } else {
        return prev;
      }

      return Math.min(Math.max(next, 0), maxTranslate);
    });
  }, []);

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
        let next = prevTranslate;

        if (deltaY > 0) next = prevTranslate - SIDEBAR_TRANSLATE_AMOUNT / 3;
        else if (deltaY < 0) next = prevTranslate + SIDEBAR_TRANSLATE_AMOUNT / 3;

        return clampTranslateToPositiveValue(next);
      });
    },
    [isDownButtonVisible, isUpButtonVisible, startY, translate],
  );

  const handleTouchEnd = useCallback(() => {
    setStartY(null);
  }, [isDownButtonVisible, isUpButtonVisible, translate, startY]);

  const handleUpButtonClick = () => {
    setTranslate((prevTranslate) => clampTranslateToPositiveValue(prevTranslate - SIDEBAR_TRANSLATE_AMOUNT));
  };

  const handleDownButtonClick = () => {
    setTranslate((prevTranslate) => clampTranslateToPositiveValue(prevTranslate + SIDEBAR_TRANSLATE_AMOUNT));
  };

  useEffect(() => {
    const appsElement = appsRef.current;
    const appsContainerElement = appsContainerRef.current;

    if (!appsElement || !appsContainerElement) return;

    const max = Math.max(0, appsElement.scrollHeight - appsContainerElement.clientHeight + SIDEBAR_ARROW_BUTTON_HEIGHT);

    setIsUpButtonVisible(translate > 0);
    setIsDownButtonVisible(translate < max);
  }, [translate, sidebarItems, size.height]);

  useEffect(() => {
    const appsElement = appsRef.current;
    if (appsElement) {
      appsElement.addEventListener('wheel', handleWheel, { passive: false });
    }

    return () => {
      if (appsElement) {
        appsElement.removeEventListener('wheel', handleWheel);
      }
    };
  }, [handleWheel]);

  useEffect(() => {
    const appsElement = appsRef.current;
    const controller = new AbortController();
    const { signal } = controller;

    if (appsElement) {
      appsElement.addEventListener('touchmove', handleTouchMove, { passive: false, signal });
      appsElement.addEventListener('touchstart', handleTouchStart, { passive: false, signal });
      appsElement.addEventListener('touchend', handleTouchEnd, { passive: false, signal });
    }

    return () => {
      controller.abort();
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  const lastRootRef = useRef<string>('');

  useLayoutEffect(() => {
    const newRoot = pathname.split('/')[1] || '';
    if (newRoot === lastRootRef.current) {
      return;
    }
    lastRootRef.current = newRoot;

    const appsElement = appsRef.current;
    const appsContainerElement = appsContainerRef.current;

    if (!appsElement || !appsContainerElement) return;

    const currentlySelectedAppElement = appsElement.querySelector<HTMLElement>('[data-selected="true"]');
    if (!currentlySelectedAppElement) return;

    const currentlySelectedAppElementTop = currentlySelectedAppElement.offsetTop;
    const currentlySelectedAppElementBottom = currentlySelectedAppElementTop + currentlySelectedAppElement.offsetHeight;
    const appsContainerHeight = appsContainerElement.clientHeight;

    let target = translate;

    if (currentlySelectedAppElementTop < translate) {
      target = currentlySelectedAppElementTop - SIDEBAR_ARROW_BUTTON_HEIGHT;
    } else if (currentlySelectedAppElementBottom > translate + appsContainerHeight) {
      target = currentlySelectedAppElementBottom - appsContainerHeight + SIDEBAR_ARROW_BUTTON_HEIGHT;
    }

    setTranslate(clampTranslateToPositiveValue(target));
  }, [pathname, sidebarItems]);

  return (
    <div className="relative h-screen w-[var(--sidebar-width)]">
      <div className="fixed right-0 z-[600] flex h-full flex-col bg-black md:bg-none">
        <HomeButton />

        {isUpButtonVisible && (
          <SidebarArrowButton
            direction="up"
            onClick={handleUpButtonClick}
          />
        )}

        <div
          ref={appsContainerRef}
          className="relative flex-1 overflow-hidden"
        >
          <div
            ref={appsRef}
            style={{ transform: `translateY(-${translate}px)` }}
          >
            {sidebarItems.map((item) => (
              <SidebarItem
                key={item.link}
                menuItem={item}
                translate={translate}
                isUpButtonVisible={isUpButtonVisible}
                isDownButtonVisible={isDownButtonVisible}
              />
            ))}
          </div>
        </div>

        {isDownButtonVisible && (
          <SidebarArrowButton
            direction="down"
            onClick={handleDownButtonClick}
          />
        )}

        <UserMenuButton />
      </div>
    </div>
  );
};

export default DesktopSidebar;
