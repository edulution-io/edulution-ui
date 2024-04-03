import React, { useState, useEffect } from 'react';
import useMenuBarConfig from '@/hooks/useMenuBarConfig';
import { MenubarMenu, MenubarSeparator, MenubarTrigger, VerticalMenubar } from '@/components/ui/MenubarSH';

import cn from '@/lib/utils';
import { useLocation } from 'react-router-dom';
import { getFromPathName } from '@/utils/common';

import useSidebarManagerStore from '@/store/sidebarManagerStore';
import { useMediaQuery } from 'usehooks-ts';

const MenuBar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useSidebarManagerStore((state) => [
    state.isMenuBarOpen,
    state.setIsMenuBarOpen,
  ]);

  const toggleMenuBar = useSidebarManagerStore((state) => state.toggleMenuBarOpen);
  const menuBarEntries = useMenuBarConfig();
  const { pathname } = useLocation();

  const [isSelected, setIsSelected] = useState(getFromPathName(pathname, 2));
  const isMobile = useMediaQuery('(max-width: 768px)');

  useEffect(() => {
    setIsCollapsed(!isMobile);
  }, [isMobile]);

  const renderMenuBarContent = () => (
    <div className="max-w-[300px]">
      <div className="bg flex flex-col items-center justify-center py-6">
        <img
          src={menuBarEntries.icon}
          alt=""
          className="h-20 w-20 object-contain"
        />
        <h3 className="mb-4 mt-4 font-bold">{menuBarEntries.title}</h3>
      </div>
      <MenubarSeparator />
      <MenubarMenu>
        {menuBarEntries.menuItems.map((item) => (
          <React.Fragment key={item.label}>
            <MenubarTrigger
              className={cn(
                'flex w-full cursor-pointer items-center gap-5 px-10 py-1 transition-colors',
                menuBarEntries.color,
                isSelected === item.id ? menuBarEntries.color.split(':')[1] : '',
              )}
              onClick={() => {
                item.action();
                setIsCollapsed(true);
                setIsSelected(item.id);
              }}
            >
              <img
                src={item.icon}
                alt=""
                className="h-12 w-12 object-contain"
              />
              <p className="text-nowrap">{item.label}</p>
            </MenubarTrigger>
            <MenubarSeparator />
          </React.Fragment>
        ))}
      </MenubarMenu>
    </div>
  );

  return (
    <div>
      {isMobile ? (
        <>
          {!isCollapsed && (
            <div
              className="fixed inset-0 z-40 bg-black bg-opacity-50"
              role="button"
              tabIndex={0}
              onClickCapture={toggleMenuBar}
              onKeyDown={(event) => {
                if (event.code === 'Enter' || event.code === 'Space') {
                  toggleMenuBar();
                }
              }}
            />
          )}

          <VerticalMenubar
            className={cn(
              'fixed top-0 z-50 h-full bg-gray-700 bg-opacity-90 duration-300 ease-in-out',
              isCollapsed ? 'w-0' : 'w-64',
              'bg-black',
            )}
          >
            {!isCollapsed && renderMenuBarContent()}
          </VerticalMenubar>

          <div
            role="button"
            tabIndex={0}
            className={cn(
              'absolute top-0 z-50 flex h-screen w-4 cursor-pointer items-center justify-center bg-gray-700 bg-opacity-60',
              isCollapsed ? 'left-0' : 'left-64',
            )}
            onClickCapture={toggleMenuBar}
            onKeyDown={(e) => e.key === 'Enter' && toggleMenuBar()}
          >
            <p className="text-xl text-white">{isCollapsed ? '≡' : '×'}</p>
          </div>
        </>
      ) : (
        <div className="relative flex h-screen">
          <VerticalMenubar className={cn('h-full overflow-hidden', 'w-64', 'bg-black', 'bg-opacity-40')}>
            {renderMenuBarContent()}
          </VerticalMenubar>
        </div>
      )}
    </div>
  );
};

export default MenuBar;
