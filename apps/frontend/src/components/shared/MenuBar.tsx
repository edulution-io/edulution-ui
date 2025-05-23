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
import { useOnClickOutside, useToggle } from 'usehooks-ts';
import useMedia from '@/hooks/useMedia';
import { getFromPathName } from '@libs/common/utils';
import APPS from '@libs/appconfig/constants/apps';
import PageTitle from '@/components/PageTitle';
import { useTranslation } from 'react-i18next';

const MenuBar: React.FC = () => {
  const { t } = useTranslation();
  const [isOpen, toggle] = useToggle(false);
  const menubarRef = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();
  const menuBarEntries = useMenuBarConfig();

  const [isSelected, setIsSelected] = useState(getFromPathName(pathname, 2));
  const { isMobileView } = useMedia();

  const navigate = useNavigate();

  useOnClickOutside(menubarRef, toggle);

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

  const renderMenuBarContent = () => (
    <div
      className="max-w-[var(--menubar-max-width)]"
      ref={menubarRef}
    >
      <div className="flex flex-col items-center justify-center py-6">
        <button
          className="flex flex-col items-center justify-center"
          type="button"
          onClick={() => {
            navigate(pathParts[0]);
            setIsSelected(pathParts[0] === APPS.SETTINGS ? '' : firstMenuBarItem);
          }}
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
        {menuBarEntries.menuItems.map((item) => (
          <React.Fragment key={item.label}>
            {isSelected === item.id && (
              <PageTitle
                title={t(`${menuBarEntries.appName}.sidebar`)}
                translationId={item.label}
              />
            )}
            <MenubarTrigger
              className={cn(
                'flex w-full cursor-pointer items-center gap-3 py-1 pl-3 pr-10 transition-colors',
                menuBarEntries.color,
                isSelected === item.id ? menuBarEntries.color.split(':')[1] : '',
              )}
              onClick={() => {
                setIsSelected(item.id);
                toggle();
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
      </MenubarMenu>
    </div>
  );

  return isMobileView ? (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground bg-opacity-50"
          role="button"
          tabIndex={0}
          onClickCapture={toggle}
        />
      )}

      <VerticalMenubar
        className={cn(
          'fixed top-0 z-50 h-full overflow-y-scroll bg-gray-700 duration-300 ease-in-out',
          !isOpen ? 'w-0' : 'w-64',
          'bg-foreground',
        )}
      >
        {isOpen && renderMenuBarContent()}
      </VerticalMenubar>

      <div
        role="button"
        tabIndex={0}
        className={cn(
          'absolute top-0 z-50 flex h-screen w-4 cursor-pointer items-center justify-center bg-gray-700 bg-opacity-60',
          !isOpen ? 'left-0' : 'left-64',
        )}
        onClickCapture={toggle}
      >
        <p className="text-xl text-background">{!isOpen ? '≡' : '×'}</p>
      </div>
    </>
  ) : (
    <div className="relative flex h-screen">
      <VerticalMenubar className="w-64 overflow-y-auto bg-foreground bg-opacity-40 scrollbar-thin">
        {renderMenuBarContent()}
      </VerticalMenubar>
    </div>
  );
};

export default MenuBar;
