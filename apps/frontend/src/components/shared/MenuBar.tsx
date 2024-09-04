import React, { useEffect, useRef, useState } from 'react';
import useMenuBarConfig from '@/hooks/useMenuBarConfig';
import { MenubarMenu, MenubarTrigger, VerticalMenubar } from '@/components/ui/MenubarSH';

import cn from '@/lib/utils';
import { useLocation } from 'react-router-dom';
import { useOnClickOutside, useToggle } from 'usehooks-ts';
import useIsMobileView from '@/hooks/useIsMobileView';
import { getFromPathName } from '@libs/common/utils';

const MenuBar: React.FC = () => {
  const [isOpen, toggle] = useToggle(false);
  const menubarRef = useRef<HTMLDivElement>(null);

  const menuBarEntries = useMenuBarConfig();
  const { pathname } = useLocation();

  const [isSelected, setIsSelected] = useState(getFromPathName(pathname, 2));
  const isMobileView = useIsMobileView();

  useOnClickOutside(menubarRef, !isOpen ? toggle : () => {});

  if (menuBarEntries.disabled) {
    return null;
  }

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const queryParams: { key: string; value: string }[] = [];

  searchParams.forEach((value, key) => {
    queryParams.push({ key, value });
  });

  const pathParts = location.pathname.split('/').filter((part) => part !== '');
  useEffect(() => {
    const matchedItem = menuBarEntries.menuItems.find((item) =>
      queryParams?.some((part) => {
        const partValue = part.value.replace(/\/$/, '').toLowerCase();
        return item.id?.toLowerCase().includes(partValue);
      }),
    );
    if (location.pathname === '/' || pathParts.at(0) !== '') {
      setIsSelected(menuBarEntries.menuItems[0]?.id);
    } else if (matchedItem) {
      setIsSelected(matchedItem.id);
    }
  }, [location.pathname, menuBarEntries.menuItems]);

  if (menuBarEntries.disabled) {
    return null;
  }

  const renderMenuBarContent = () => (
    <div
      className="max-w-[300px]"
      ref={menubarRef}
    >
      <div className="bg flex flex-col items-center justify-center py-6">
        <img
          src={menuBarEntries.icon}
          alt=""
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
                item.action();
                setIsSelected(item.id);
                toggle();
              }}
            >
              <img
                src={item.icon}
                alt=""
                className="h-12 w-12 object-contain"
              />
              <p className="text-nowrap">{item.label}</p>
            </MenubarTrigger>
          </React.Fragment>
        ))}
      </MenubarMenu>
    </div>
  );

  return (
    <div>
      {isMobileView ? (
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
              'fixed top-0 z-50 h-full overflow-y-scroll bg-gray-700 bg-opacity-90 duration-300 ease-in-out',
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
            <p className="text-xl text-white">{!isOpen ? '≡' : '×'}</p>
          </div>
        </>
      ) : (
        <div className="relative flex h-screen">
          <VerticalMenubar className="w-64 overflow-y-auto bg-black bg-opacity-40 scrollbar-thin">
            {renderMenuBarContent()}
          </VerticalMenubar>
        </div>
      )}
    </div>
  );
};

export default MenuBar;
