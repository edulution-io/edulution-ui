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

  const [isSelected, setIsSelected] = useState(getFromPathName(pathname, 2));
  const { isMobileView, isTabletView } = useMedia();
  const isDesktopView = !isMobileView && !isTabletView && !isEdulutionApp;
  const navigate = useNavigate();

  useOnClickOutside(menubarRef, () => {
    if (isMobileView || isTabletView) toggleMobileMenuBar();
  });

  if (menuBarEntries.disabled) {
    return null;
  }

  const firstMenuBarItem = menuBarEntries?.menuItems[0]?.id || '';

  const pathParts = useMemo(() => pathname.split('/').filter(Boolean), [pathname]);

  useEffect(() => {
    if (pathParts[1]) {
      setIsSelected(pathParts[1]);
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
    <div
      className="flex h-full max-w-[var(--menubar-max-width)] flex-col"
      ref={menubarRef}
    >
      <div className="flex flex-col items-center justify-center py-6">
        {isDesktopView && (
          <Button
            type="button"
            variant="btn-outline"
            size="sm"
            onClick={toggleCollapsed}
            className={cn(
              'absolute right-[-25px] top-2 mx-3 mb-4 border-accent px-2 py-1',
              isCollapsed ? 'cursor-e-resize ' : 'cursor-w-resize ',
            )}
          >
            {isCollapsed ? <GoSidebarCollapse size={18} /> : <GoSidebarExpand size={18} />}
          </Button>
        )}

        <button
          className="flex flex-col items-center justify-center rounded-xl hover:bg-accent"
          type="button"
          onClick={handleHeaderIconClick}
        >
          <img
            src={menuBarEntries.icon}
            alt={menuBarEntries.title}
            className={cn('object-contain transition-all', isCollapsed ? 'h-10 w-10' : 'h-20 w-20')}
          />
          {!isCollapsed && <h2 className="mb-4 mt-4 text-center font-bold">{menuBarEntries.title}</h2>}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pb-10">
        {menuBarEntries.menuItems.map((item) => {
          const content = (
            <button
              type="button"
              onClick={() => {
                setIsSelected(item.id);
                toggleMobileMenuBar();
                item.action();
              }}
              className={cn(
                'flex w-full items-center gap-3 py-1 pl-3 pr-3 transition-colors',
                menuBarEntries.color,
                isSelected === item.id ? menuBarEntries.color.split(':')[1] : '',
                isCollapsed && 'justify-center',
              )}
            >
              <img
                src={item.icon}
                alt={item.label}
                className="h-12 w-12 object-contain"
              />
              {!isCollapsed && <p>{item.label}</p>}
            </button>
          );

          return isCollapsed ? (
            <Tooltip key={item.id}>
              <TooltipTrigger asChild>{content}</TooltipTrigger>
              <TooltipContent side="right">{item.label}</TooltipContent>
            </Tooltip>
          ) : (
            <React.Fragment key={item.id}>{content}</React.Fragment>
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

      {!isDesktopView ? (
        <div
          className={cn(
            'fixed left-0 top-0 z-50 h-full overflow-x-hidden bg-black duration-300 ease-in-out',
            isMobileMenuBarOpen ? 'w-64 border-r-[1px] border-muted' : 'w-0',
          )}
        >
          <div
            className={cn(
              'h-full w-64 transition-opacity duration-300',
              isMobileMenuBarOpen ? 'opacity-100' : 'opacity-0',
            )}
          >
            {isMobileMenuBarOpen && renderMenuBarContent()}
          </div>
        </div>
      ) : (
        <aside className="relative flex h-dvh">
          <div
            className={cn(
              'h-full overflow-hidden bg-foreground bg-opacity-40 transition-all duration-300',
              isCollapsed ? 'w-16' : 'w-64',
            )}
          >
            {renderMenuBarContent()}
          </div>
        </aside>
      )}
    </>
  );
};

export default MenuBar;
