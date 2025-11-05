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

import React, { useEffect, useMemo, useRef, useState } from 'react';
import useMenuBarConfig from '@/hooks/useMenuBarConfig';
import { MenubarMenu, MenubarTrigger, VerticalMenubar } from '@/components/ui/MenubarSH';

import cn from '@libs/common/utils/className';
import { useLocation, useNavigate } from 'react-router-dom';
import { useOnClickOutside } from 'usehooks-ts';
import useMedia from '@/hooks/useMedia';
import { getFromPathName } from '@libs/common/utils';
import APPS from '@libs/appconfig/constants/apps';
import PageTitle from '@/components/PageTitle';
import { useTranslation } from 'react-i18next';
import URL_SEARCH_PARAMS from '@libs/common/constants/url-search-params';
import useFileSharingStore from '@/pages/FileSharing/useFileSharingStore';
import useVariableSharePathname from '@/pages/FileSharing/hooks/useVariableSharePathname';
import useMenuBarStore from './useMenuBarStore';

const MenuBar: React.FC = () => {
  const { t } = useTranslation();
  const { isMobileMenuBarOpen, toggleMobileMenuBar } = useMenuBarStore();
  const menubarRef = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();
  const menuBarEntries = useMenuBarConfig();
  const { setCurrentPath, setPathToRestoreSession } = useFileSharingStore();
  const webdavShares = useFileSharingStore((state) => state.webdavShares);
  const { createVariableSharePathname } = useVariableSharePathname();

  const [isSelected, setIsSelected] = useState(getFromPathName(pathname, 2));
  const { isMobileView } = useMedia();

  const navigate = useNavigate();

  useOnClickOutside(menubarRef, toggleMobileMenuBar);

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
        <button
          className="flex flex-col items-center justify-center"
          type="button"
          onClick={handleHeaderIconClick}
        >
          <img
            src={menuBarEntries.icon}
            alt={menuBarEntries.title}
            className="h-20 w-20 object-contain"
          />
          <h3 className="mb-4 mt-4 text-center font-bold">{menuBarEntries.title}</h3>
        </button>
      </div>
      <MenubarMenu>
        <div className="flex-1 overflow-y-auto pb-10 scrollbar-thin">
          {menuBarEntries.menuItems.map((item) => (
            <React.Fragment key={item.label}>
              <MenubarTrigger
                className={cn(
                  'flex w-full cursor-pointer items-center gap-3 py-1 pl-3 pr-10 transition-colors',
                  menuBarEntries.color,
                  isSelected === item.id ? menuBarEntries.color.split(':')[1] : '',
                )}
                onClick={() => {
                  setIsSelected(item.id);
                  toggleMobileMenuBar();
                  item.action();
                }}
              >
                <img
                  src={item.icon}
                  alt={item.label}
                  className="h-12 w-12 object-contain"
                />
                <p className="text-left">{item.label}</p>
              </MenubarTrigger>
            </React.Fragment>
          ))}
        </div>
      </MenubarMenu>
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

      {isMobileView ? (
        <VerticalMenubar
          className={cn(
            'fixed top-0 z-50 h-full overflow-hidden bg-foreground duration-300 ease-in-out',
            isMobileMenuBarOpen ? 'w-64 border-r-[1px] border-muted' : 'w-0',
          )}
        >
          <div
            className={cn('w-64 transition-opacity duration-300', isMobileMenuBarOpen ? 'opacity-100' : 'opacity-0')}
          >
            {isMobileMenuBarOpen && renderMenuBarContent()}
          </div>
        </VerticalMenubar>
      ) : (
        <div className="relative flex h-screen">
          <VerticalMenubar className="w-64 bg-foreground bg-opacity-40">{renderMenuBarContent()}</VerticalMenubar>
        </div>
      )}
    </>
  );
};

export default MenuBar;
