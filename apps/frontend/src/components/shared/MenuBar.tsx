import React, { useEffect, useMemo, useRef, useState } from 'react';
import useMenuBarConfig from '@/hooks/useMenuBarConfig';
import { MenubarMenu, MenubarTrigger, VerticalMenubar } from '@/components/ui/MenubarSH';

import cn from '@libs/common/utils/className';
import { useLocation } from 'react-router-dom';
import { useOnClickOutside, useToggle } from 'usehooks-ts';
import useIsMobileView from '@/hooks/useIsMobileView';
import { getFromPathName } from '@libs/common/utils';
import APPS from '@libs/appconfig/constants/apps';

const MenuBar: React.FC = () => {
  const [isOpen, toggle] = useToggle(false);
  const menubarRef = useRef<HTMLDivElement>(null);
  const { pathname, search } = useLocation();
  const menuBarEntries = useMenuBarConfig();

  const [isSelected, setIsSelected] = useState(getFromPathName(pathname, 2));
  const isMobileView = useIsMobileView();

  useOnClickOutside(menubarRef, !isOpen ? toggle : () => {});

  if (menuBarEntries.disabled) {
    return null;
  }

  const firstMenuBarItem = menuBarEntries?.menuItems[0]?.id || '';

  const pathParts = useMemo(() => pathname.split('/').filter(Boolean), [pathname]);
  const queryParams = useMemo(() => {
    const params = new URLSearchParams(search);
    return Array.from(params.entries()).map(([key, value]) => ({ key, value }));
  }, [search]);

  const shouldSelectFirstItem = useMemo(() => {
    const globalCondition = pathParts.length === 2 && firstMenuBarItem === pathParts[1];
    const fileSharingCondition =
      pathParts.length === 1 && pathParts[0] === APPS.FILE_SHARING && queryParams.length !== 1;

    return pathname === '/' || fileSharingCondition || globalCondition;
  }, [pathParts, queryParams]);

  useEffect(() => {
    const matchedItem = menuBarEntries.menuItems.find((item) =>
      queryParams.some((param) => item.id?.toLowerCase().includes(param.value.toLowerCase())),
    );

    if (shouldSelectFirstItem) {
      setIsSelected(firstMenuBarItem);
    } else if (matchedItem) {
      setIsSelected(matchedItem.id);
    }
  }, [pathname, menuBarEntries.menuItems, queryParams, shouldSelectFirstItem]);

  const renderMenuBarContent = () => (
    <div
      className="max-w-[var(--menubar-max-width)]"
      ref={menubarRef}
    >
      <div className="bg flex flex-col items-center justify-center py-6">
        <img
          src={menuBarEntries.icon}
          alt={menuBarEntries.title}
          className="h-20 w-20 object-contain"
        />
        <h3 className="mb-4 mt-4 text-center font-bold">{menuBarEntries.title}</h3>
      </div>
      <MenubarMenu>
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
                toggle();
                item.action();
              }}
            >
              <img
                src={item.icon}
                alt={item.label}
                className="h-12 w-12 object-contain"
              />
              <p className="text-nowrap">{item.label}</p>
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
          className="fixed inset-0 z-40 bg-black bg-opacity-50"
          role="button"
          tabIndex={0}
          onClickCapture={toggle}
        />
      )}

      <VerticalMenubar
        className={cn(
          'fixed top-0 z-50 h-full overflow-y-scroll bg-gray-700 duration-300 ease-in-out',
          !isOpen ? 'w-0' : 'w-64',
          'bg-black',
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
      <VerticalMenubar className="w-64 overflow-y-auto bg-black bg-opacity-40 scrollbar-thin">
        {renderMenuBarContent()}
      </VerticalMenubar>
    </div>
  );
};

export default MenuBar;
