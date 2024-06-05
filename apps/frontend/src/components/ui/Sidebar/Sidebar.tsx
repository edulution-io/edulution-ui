import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMediaQuery, useWindowSize } from 'usehooks-ts';
import { SettingsIcon } from '@/assets/icons';
import { findAppConfigByName } from '@/utils/common';
import useAppConfigsStore from '@/store/appConfigsStore';
import { APP_CONFIG_OPTIONS } from '@/pages/Settings/AppConfig/appConfigOptions';
import { SIDEBAR_TRANSLATE_AMOUNT } from '@/constants/style';
import DesktopSidebar from './DesktopSidebar';
import MobileSidebar from './MobileSidebar';

const Sidebar: React.FC = () => {
  const { t } = useTranslation();
  const { appConfig } = useAppConfigsStore();
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const sidebarIconsRef = useRef<HTMLDivElement>(null);
  const size = useWindowSize();
  const [translate, setTranslate] = useState(0);
  const [isUpButtonVisible, setIsUpButtonVisible] = useState(false);
  const [isDownButtonVisible, setIsDownButtonVisible] = useState(false);
  const [startY, setStartY] = useState<number | null>(null);

  const sidebarItems = [
    ...APP_CONFIG_OPTIONS.filter((option) => findAppConfigByName(appConfig, option.id)).map((item) => ({
      title: t(`${item.id}.sidebar`),
      link: `/${item.id}`,
      icon: item.icon,
      color: 'bg-ciGreenToBlue',
    })),
    {
      title: t('settings.sidebar'),
      link: '/settings',
      icon: SettingsIcon,
      color: 'bg-ciGreenToBlue',
    },
  ];

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

  const sidebarProps = {
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
  };

  return isDesktop ? (
    <DesktopSidebar
      ref={sidebarIconsRef}
      {...sidebarProps}
    />
  ) : (
    <MobileSidebar
      ref={sidebarIconsRef}
      {...sidebarProps}
    />
  );
};

export default Sidebar;
