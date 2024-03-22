import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

import useMenuBarConfig from '@/hooks/useMenuBarConfig';
import { MenubarMenu, MenubarSeparator, MenubarTrigger, VerticalMenubar } from '@/components/ui/menubar';

import cn from '@/lib/utils';
import useMediaQuery from '@/hooks/media/useMediaQuery';

const MenuBar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const location = useLocation();
  const menuBarEntries = useMenuBarConfig(location.pathname);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const toggleMenuBar = () => setIsCollapsed(!isCollapsed);

  useEffect(() => {
    if (!isMobile) {
      setIsCollapsed(false);
    }
  }, [isMobile]);

  return (
    <div className="relative flex h-screen">
      <VerticalMenubar
        className={cn('h-full overflow-hidden', isCollapsed ? 'w-0' : 'w-64')}
        style={{ backgroundColor: isCollapsed ? 'transparent' : 'rgba(0, 0, 0, 0.4)' }}
      >
        <div className={cn({ hidden: isCollapsed }, 'w-full')}>
          <div className="flex flex-col items-center justify-center py-6">
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
                  className="flex w-full cursor-pointer items-center gap-5 px-10 py-1 transition-colors"
                  onClick={item.action}
                >
                  <img
                    src={item.icon}
                    alt=""
                    className="h-12 w-12 object-contain"
                  />
                  {!isCollapsed && <p>{item.label}</p>}
                </MenubarTrigger>
                <MenubarSeparator />
              </React.Fragment>
            ))}
          </MenubarMenu>
        </div>
      </VerticalMenubar>
      {isMobile && (
        <div
          role="button"
          tabIndex={0}
          className="absolute left-full top-0 z-20 flex h-full w-4 cursor-pointer items-center justify-center bg-gray-700 bg-opacity-60"
          onClick={toggleMenuBar}
          onKeyDown={toggleMenuBar}
        >
          {isCollapsed ? <p className="text-sm">||</p> : <p className="text-sm">||</p>}
        </div>
      )}
    </div>
  );
};

export default MenuBar;
