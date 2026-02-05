/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
 *
 * This software is dual-licensed under the terms of:
 *
 * 1. The GNU Affero General Public License (AGPL-3.0-or-later), as published by the Free Software Foundation.
 *    You may use, modify and distribute this software under the terms of the AGPL, provided that you comply with its conditions.
 *
 *    A copy of the license can be found at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * OR
 *
 * 2. A commercial license agreement with Netzint GmbH. Licensees holding a valid commercial license from Netzint GmbH
 *    may use this software in accordance with the terms contained in such written agreement, without the obligations imposed by the AGPL.
 *
 * If you are uncertain which license applies to your use case, please contact us at info@netzint.de for clarification.
 */

import React, { isValidElement, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import useMenuBarConfig from '@/hooks/useMenuBarConfig';
import { cn , Button } from '@edulution-io/ui-kit';
import { useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowRightToBracket,
  faArrowRightFromBracket,
  IconDefinition,
  faChevronDown,
} from '@fortawesome/free-solid-svg-icons';
import { useOnClickOutside } from 'usehooks-ts';
import useMedia from '@/hooks/useMedia';
import { getFromPathName } from '@libs/common/utils';
import APPS from '@libs/appconfig/constants/apps';
import PageTitle from '@/components/PageTitle';
import { useTranslation } from 'react-i18next';
import URL_SEARCH_PARAMS from '@libs/common/constants/url-search-params';
import useFileSharingStore from '@/pages/FileSharing/useFileSharingStore';
import useVariableSharePathname from '@/pages/FileSharing/hooks/useVariableSharePathname';
import usePlatformStore from '@/store/EduApiStore/usePlatformStore';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/Tooltip';
import useSubMenuStore from '@/store/useSubMenuStore';
import useMenuBarStore from './useMenuBarStore';
import MenuBarFooter from './MenuBarFooter';
import IconWrapper from './IconWrapper';

const MenuBar: React.FC = () => {
  const { t } = useTranslation();
  const { isMobileMenuBarOpen, toggleMobileMenuBar, closeMobileMenuBar, isCollapsed, toggleCollapsed } =
    useMenuBarStore();
  const { activeSection } = useSubMenuStore();
  const menubarRef = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();
  const menuBarEntries = useMenuBarConfig();
  const { setCurrentPath, setPathToRestoreSession } = useFileSharingStore();
  const webdavShares = useFileSharingStore((state) => state.webdavShares);
  const { createVariableSharePathname } = useVariableSharePathname();
  const isEdulutionApp = usePlatformStore((state) => state.isEdulutionApp);

  const [isSelected, setIsSelected] = useState(getFromPathName(pathname, 2));
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const { isMobileView, isTabletView } = useMedia();
  const isDesktopView = !isMobileView && !isTabletView && !isEdulutionApp;
  const shouldCollapse = isDesktopView && isCollapsed;
  const navigate = useNavigate();

  const handleClickOutside = useCallback(() => {
    if ((isMobileView || isTabletView) && isMobileMenuBarOpen) {
      closeMobileMenuBar();
    }
  }, [isMobileView, isTabletView, isMobileMenuBarOpen, closeMobileMenuBar]);

  useOnClickOutside(menubarRef, handleClickOutside);

  const renderIcon = useCallback(
    (
      icon: string | IconDefinition | React.ReactElement,
      alt: string,
      baseClassName?: string,
      applyIconClassName = true,
    ) => {
      if (isValidElement(icon)) {
        return icon;
      }

      if (typeof icon === 'string') {
        return (
          <IconWrapper
            iconSrc={icon}
            alt={alt}
            className={cn(baseClassName, 'object-contain')}
            applyLegacyFilter={applyIconClassName}
          />
        );
      }
      return (
        <FontAwesomeIcon
          icon={icon as IconDefinition}
          className={cn(
            baseClassName,
            'scale-75',
            applyIconClassName ? 'text-background dark:text-white' : 'text-white',
          )}
        />
      );
    },
    [],
  );

  const toggleExpanded = useCallback((itemId: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  }, []);

  const getActiveColorClass = useCallback((color: string) => color.split(':')[1] ?? color, []);

  if (menuBarEntries.disabled) {
    return null;
  }

  const firstMenuBarItem = menuBarEntries?.menuItems[0]?.id || '';

  const pathParts = useMemo(() => pathname.split('/').filter(Boolean), [pathname]);

  useEffect(() => {
    if (pathParts[1]) {
      setIsSelected(pathParts[1]);
      setExpandedItems((prev) => new Set(prev).add(pathParts[1]));
    }
  }, [pathParts]);

  const handleHeaderIconClick = () => {
    switch (pathParts[0]) {
      case APPS.FILE_SHARING: {
        const currentShare = webdavShares.find((s) => s.displayName === pathParts[1]) ?? webdavShares[0];

        if (!currentShare || currentShare.isRootServer) break;

        let currentSharePath = currentShare.pathname;
        if (currentShare.pathVariables) {
          currentSharePath = createVariableSharePathname(currentSharePath, currentShare.pathVariables);
        }

        setCurrentPath(currentSharePath);
        setPathToRestoreSession(currentSharePath);

        navigate(
          {
            pathname: `/${APPS.FILE_SHARING}/${currentShare.displayName}`,
            search: `?${URL_SEARCH_PARAMS.PATH}=${encodeURIComponent(currentSharePath)}`,
          },
          { replace: true },
        );
        break;
      }
      case APPS.SETTINGS: {
        navigate(pathParts[0]);
        setIsSelected('');
        break;
      }
      default:
        navigate(pathParts[0]);
        setIsSelected(firstMenuBarItem);
    }
  };

  const activeItem = useMemo(
    () => menuBarEntries.menuItems.find((item) => item.id === isSelected),
    [isSelected, menuBarEntries.menuItems],
  );

  const renderMenuBarContent = () => (
    <div className="flex h-full max-w-[var(--menubar-max-width)] flex-col">
      <div className="flex flex-col items-center justify-center py-6">
        <button
          className="flex flex-col items-center justify-center rounded-xl p-2 hover:bg-muted-background"
          type="button"
          onClick={handleHeaderIconClick}
        >
          {renderIcon(
            menuBarEntries.icon,
            menuBarEntries.title,
            cn('object-contain transition-all', shouldCollapse ? 'h-10 w-10' : 'h-20 w-20'),
            true,
          )}
          {!shouldCollapse && <h2 className="mb-2 mt-2 text-center font-bold">{menuBarEntries.title}</h2>}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pb-10">
        {menuBarEntries.menuItems.map((item) => {
          const hasChildren = item.children && item.children.length > 0;
          const isExpanded = expandedItems.has(item.id);
          const isActive = isSelected === item.id;

          const handleItemClick = () => {
            setIsSelected(item.id);
            if (isMobileView || isTabletView) toggleMobileMenuBar();
            item.action();

            if (hasChildren && !isExpanded) {
              setExpandedItems((prev) => new Set(prev).add(item.id));
            }
          };

          const handleExpandClick = (e: React.MouseEvent) => {
            e.stopPropagation();
            toggleExpanded(item.id);
          };

          const childrenId = `${item.id}-children`;

          const mainButton = (
            <div
              role="button"
              tabIndex={0}
              onClick={handleItemClick}
              onKeyDown={(e) => e.key === 'Enter' && handleItemClick()}
              aria-expanded={hasChildren ? isExpanded : undefined}
              aria-controls={hasChildren ? childrenId : undefined}
              aria-label={item.label}
              className={cn(
                'flex w-full cursor-pointer items-center gap-3 py-1 pl-3 pr-3 transition-colors hover:bg-muted-background',
                isActive ? getActiveColorClass(menuBarEntries.color) : '',
                shouldCollapse && 'justify-center',
              )}
            >
              {renderIcon(item.icon, item.label, 'h-12 w-12 object-contain', !isActive)}
              {!shouldCollapse && (
                <>
                  <span className={cn('flex-1 text-left', isActive ? 'text-white' : '')}>{item.label}</span>
                  {hasChildren && (
                    <Button
                      type="button"
                      variant="btn-ghost"
                      onClick={handleExpandClick}
                      aria-label={isExpanded ? t('common.collapse') : t('common.expand')}
                      className="p-1"
                    >
                      <FontAwesomeIcon
                        icon={faChevronDown}
                        className={cn(
                          'h-4 w-4 shrink-0 text-white transition-transform duration-200',
                          isExpanded && 'rotate-180',
                        )}
                      />
                    </Button>
                  )}
                </>
              )}
            </div>
          );

          const childrenContent = hasChildren && !shouldCollapse && (
            <div
              id={childrenId}
              role="region"
              aria-label={`${item.label} sections`}
              className={cn(
                'grid transition-all duration-200 ease-in-out',
                isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
              )}
            >
              <div className="overflow-hidden">
                <div className="ml-2">
                  {item.children!.map((child) => {
                    const isChildActive = activeSection === child.id;
                    return (
                      <Button
                        key={child.id}
                        type="button"
                        variant="btn-ghost"
                        onClick={() => {
                          if (isMobileView || isTabletView) toggleMobileMenuBar();
                          child.action();
                        }}
                        className={cn(
                          'flex w-full items-center justify-start py-2 pl-4 pr-3 font-normal',
                          'transition-all duration-150',
                          'hover:pl-5',
                          isChildActive && 'bg-accent font-bold',
                        )}
                      >
                        <span className="truncate">{child.label}</span>
                      </Button>
                    );
                  })}
                </div>
              </div>
            </div>
          );

          return shouldCollapse ? (
            <Tooltip key={item.id}>
              <TooltipTrigger asChild>{mainButton}</TooltipTrigger>
              <TooltipContent side="right">{item.label}</TooltipContent>
            </Tooltip>
          ) : (
            <div key={item.id}>
              {mainButton}
              {childrenContent}
            </div>
          );
        })}
      </div>

      <MenuBarFooter
        appName={pathParts[0]}
        isCollapsed={shouldCollapse}
      />
    </div>
  );

  return (
    <>
      {activeItem && (
        <PageTitle
          title={t(`${menuBarEntries.appName}.sidebar`)}
          translationId={activeItem.label}
          disableTranslation={activeItem.disableTranslation}
        />
      )}

      {isDesktopView ? (
        <aside className="relative flex h-dvh">
          <div
            className={cn(
              'bg-glass h-full overflow-hidden rounded-r-xl shadow-lg shadow-slate-400 backdrop-blur-lg transition-all duration-300',
              shouldCollapse ? 'w-16' : 'w-64',
            )}
          >
            {renderMenuBarContent()}
          </div>
          <Button
            type="button"
            variant="btn-outline"
            size="sm"
            onClick={toggleCollapsed}
            className={cn(
              'bg-glass absolute right-[-15px] top-2 z-10 border-accent px-2 py-1 backdrop-blur-lg hover:bg-muted-background',
              shouldCollapse ? 'cursor-e-resize' : 'cursor-w-resize',
            )}
          >
            {isCollapsed ? (
              <FontAwesomeIcon icon={faArrowRightToBracket} />
            ) : (
              <FontAwesomeIcon
                icon={faArrowRightFromBracket}
                className="rotate-180"
              />
            )}
          </Button>
        </aside>
      ) : (
        <div
          className="fixed left-0 top-0 z-50 h-full w-full transform transition-transform duration-300 ease-in-out"
          style={{ transform: `translateX(${isMobileMenuBarOpen ? '0%' : '-100%'})` }}
        >
          <div
            ref={menubarRef}
            className="bg-glass fixed left-0 h-full w-64 overflow-x-hidden border-r-[1px] border-muted backdrop-blur-md"
          >
            {renderMenuBarContent()}
          </div>
        </div>
      )}
    </>
  );
};

export default MenuBar;
