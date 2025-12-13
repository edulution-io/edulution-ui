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

import React, { useEffect, useMemo, useRef, useState } from 'react';
import useMenuBarConfig from '@/hooks/useMenuBarConfig';
import cn from '@libs/common/utils/className';
import { useLocation, useNavigate } from 'react-router-dom';
import { GoSidebarCollapse, GoSidebarExpand } from 'react-icons/go';
import { ChevronDownIcon } from '@radix-ui/react-icons';
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
import getAppIconClassName from '@libs/ui/utils/getAppIconClassName';
import MenuItem from '@libs/menubar/menuItem';
import Input from '@/components/shared/Input';
import useMenuBarStore from './useMenuBarStore';
import { Button } from './Button';

const MenuBar: React.FC = () => {
  const { t } = useTranslation();
  const { isMobileMenuBarOpen, toggleMobileMenuBar, isCollapsed, toggleCollapsed } = useMenuBarStore();
  const menubarRef = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();
  const menuBarEntries = useMenuBarConfig();
  const { setCurrentPath, setPathToRestoreSession } = useFileSharingStore();
  const webdavShares = useFileSharingStore((state) => state.webdavShares);
  const { createVariableSharePathname } = useVariableSharePathname();
  const isEdulutionApp = usePlatformStore((state) => state.isEdulutionApp);
  const [searchQuery, setSearchQuery] = useState('');

  const [isSelected, setIsSelected] = useState(getFromPathName(pathname, 2));
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const { isMobileView, isTabletView } = useMedia();
  const isDesktopView = !isMobileView && !isTabletView && !isEdulutionApp;
  const shouldCollapse = isDesktopView && isCollapsed;
  const navigate = useNavigate();

  const pathParts = useMemo(() => pathname.split('/').filter(Boolean), [pathname]);
  const firstMenuBarItem = menuBarEntries?.menuItems[0]?.id || '';

  const filteredMenuItems = useMemo(() => {
    if (!searchQuery.trim()) return menuBarEntries.menuItems;

    const lowerQuery = searchQuery.toLowerCase();

    return menuBarEntries.menuItems
      .map((item) => {
        const itemMatches = item.label.toLowerCase().includes(lowerQuery);

        const filteredChildren = item.children?.filter((child) => child.label.toLowerCase().includes(lowerQuery));

        if (itemMatches) {
          return item;
        }

        if (filteredChildren && filteredChildren.length > 0) {
          return { ...item, children: filteredChildren };
        }

        return null;
      })
      .filter(Boolean) as MenuItem[];
  }, [menuBarEntries.menuItems, searchQuery]);

  const isSearching = searchQuery.trim().length > 0;

  useOnClickOutside(menubarRef, () => {
    if (isMobileView || isTabletView) toggleMobileMenuBar();
  });

  useEffect(() => {
    if (pathParts[1]) {
      setIsSelected(pathParts[1]);
      setExpandedItems((prev) => new Set(prev).add(pathParts[1]));
    }
  }, [pathParts]);

  if (menuBarEntries.disabled) {
    return null;
  }

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

  const toggleExpanded = (itemId: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  const activeItem = useMemo(
    () => menuBarEntries.menuItems.find((item) => item.id === isSelected),
    [isSelected, menuBarEntries.menuItems],
  );

  const renderMenuBarContent = () => (
    <div
      className="flex h-full max-w-[var(--menubar-max-width)] flex-col"
      ref={menubarRef}
    >
      <div className="flex flex-col items-center justify-center py-6">
        <button
          className="flex flex-col items-center justify-center rounded-lg p-2 hover:bg-muted-background"
          type="button"
          onClick={handleHeaderIconClick}
        >
          <img
            src={menuBarEntries.icon}
            alt={menuBarEntries.title}
            className={cn(
              'object-contain transition-all',
              shouldCollapse ? 'h-10 w-10' : 'h-20 w-20',
              getAppIconClassName(menuBarEntries.icon),
            )}
          />
          {!shouldCollapse && <h2 className="mb-2 mt-2 text-center text-background">{menuBarEntries.title}</h2>}
        </button>
      </div>

      {!shouldCollapse && (
        <div className="px-3 pb-3">
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('common.search')}
          />
        </div>
      )}

      <div className="flex-1 overflow-y-auto pb-10">
        {filteredMenuItems.length === 0 && isSearching && (
          <div className="px-3 py-6 text-center text-sm text-muted-foreground">{t('common.noResults')}</div>
        )}

        {filteredMenuItems.map((item) => {
          const hasChildren = item.children && item.children.length > 0;
          const isExpanded = expandedItems.has(item.id) || isSearching;
          const isActive = isSelected === item.id;

          const handleItemClick = () => {
            setIsSelected(item.id);
            if (isMobileView || isTabletView) toggleMobileMenuBar();
            item.action();

            if (hasChildren && !isExpanded && !isSearching) {
              setExpandedItems((prev) => new Set(prev).add(item.id));
            }
          };

          const handleExpandClick = (e: React.MouseEvent) => {
            e.stopPropagation();
            if (!isSearching) {
              toggleExpanded(item.id);
            }
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
                'flex w-full cursor-pointer items-center gap-3 rounded-lg py-1 pl-3 pr-3 transition-colors hover:bg-accent',
                menuBarEntries.color,
                isActive ? menuBarEntries.color.split(':')[1] : '',
                shouldCollapse && 'justify-center',
              )}
            >
              <img
                src={item.icon}
                alt=""
                aria-hidden="true"
                className={cn(
                  'h-12 w-12 object-contain',
                  isSelected !== item.id && getAppIconClassName(item?.icon || ''),
                )}
              />
              {!shouldCollapse && (
                <>
                  <p className="flex-1 text-left text-background">{item.label}</p>
                  {hasChildren && !isSearching && (
                    <button
                      type="button"
                      onClick={handleExpandClick}
                      aria-label={isExpanded ? 'Collapse' : 'Expand'}
                      className="rounded-lg p-1 hover:bg-accent"
                    >
                      <ChevronDownIcon
                        className={cn('h-4 w-4 transition-transform duration-200', isExpanded && 'rotate-180')}
                      />
                    </button>
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
                <div className="border-muted/50 ml-12 border-l py-1">
                  {item.children!.map((child) => {
                    const isChildActive = pathname.includes(child.id);
                    return (
                      <button
                        key={child.id}
                        type="button"
                        onClick={() => {
                          if (isMobileView || isTabletView) toggleMobileMenuBar();
                          child.action();
                        }}
                        className={cn(
                          'flex w-full items-center gap-2 rounded-r-lg py-2 pl-4 pr-3 text-left text-sm',
                          'text-background transition-all duration-150',
                          'hover:bg-accent hover:pl-5',
                          isChildActive && 'bg-accent/50 font-medium',
                        )}
                      >
                        {child.iconComponent && <span className="flex-shrink-0">{child.iconComponent}</span>}
                        {!child.iconComponent && child.icon && (
                          <img
                            src={child.icon}
                            alt=""
                            aria-hidden="true"
                            className="h-6 w-6 flex-shrink-0 object-contain"
                          />
                        )}
                        <span className="truncate">{child.label}</span>
                      </button>
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
              'h-full overflow-hidden rounded-r-xl bg-transparent shadow-lg shadow-slate-400 backdrop-blur-lg transition-all duration-300',
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
              'absolute right-[-15px] top-2 z-20 border-accent bg-transparent px-2 py-1 text-background backdrop-blur-lg hover:bg-muted-background hover:text-background',
              shouldCollapse ? 'cursor-e-resize' : 'cursor-w-resize',
            )}
          >
            {isCollapsed ? <GoSidebarCollapse size={18} /> : <GoSidebarExpand size={18} />}
          </Button>
        </aside>
      ) : (
        <div
          className={cn(
            'fixed left-0 top-0 z-50 h-full overflow-x-hidden bg-foreground duration-300 ease-in-out',
            isMobileMenuBarOpen ? 'w-64 border-r-[1px] border-muted' : 'w-0',
          )}
        >
          {isMobileMenuBarOpen && renderMenuBarContent()}
        </div>
      )}
    </>
  );
};

export default MenuBar;
