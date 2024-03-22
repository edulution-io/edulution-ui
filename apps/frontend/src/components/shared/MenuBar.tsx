import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { FaChevronLeft } from 'react-icons/fa';

import useMenuBarConfig from '@/hooks/useMenuBarConfig';
import { MenubarMenu, MenubarSeparator, MenubarTrigger, VerticalMenubar } from '@/components/ui/menubar';

import cn from '@/lib/utils';
import useMediaQuery from '@/hooks/media/useMediaQuery';

const MenuBar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isFixed, setIsFixed] = useState(false);
  const location = useLocation();
  const menuBarEntries = useMenuBarConfig(location.pathname);
  const isMobile = useMediaQuery('(max-width: 768px)');

  useEffect(() => {
    setIsCollapsed(!isMobile);
  }, [isMobile]);

  const toggleMenuBar = () => {
    setIsFixed((prevState) => !prevState);
    setIsCollapsed((prevState) => !prevState);
  };

  const handleMouseEnter = () => {
    if (!isMobile && !isFixed) {
      setIsCollapsed(false);
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile && !isFixed) {
      setIsCollapsed(true);
    }
  };

  const renderMenuBarContent = () => (
    <div className="w-full">
      <div className="flex flex-col items-center justify-center py-6">
        <img
          src={menuBarEntries.icon}
          alt=""
          className="h-16 w-16 object-contain"
        />
        <h3 className={cn('mb-4 mt-4 font-bold', { hidden: isCollapsed })}>{menuBarEntries.title}</h3>
      </div>
      <MenubarSeparator />
      <MenubarMenu>
        {menuBarEntries.menuItems.map((item) => (
          <React.Fragment key={item.label}>
            <MenubarTrigger
              className={`flex w-full cursor-pointer items-center ${!isCollapsed ? 'gap-5 px-10' : 'justify-center'} py-1 transition-colors`}
              onClick={item.action}
            >
              <img
                src={item.icon}
                alt=""
                className={`${!isMobile && isCollapsed ? 'w-14' : 'w-12'} object-contain`}
              />
              {!isCollapsed && <p>{item.label}</p>}
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
              onClick={toggleMenuBar}
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
            onClick={toggleMenuBar}
            onKeyDown={(e) => e.key === 'Enter' && toggleMenuBar()}
          >
            <p className="text-xl text-white">{isCollapsed ? '≡' : '×'}</p>
          </div>
        </>
      ) : (
        <div className="relative flex h-screen">
          <VerticalMenubar
            id="menubar"
            className={cn('transition-width h-full overflow-hidden bg-black duration-300 ease-in-out', {
              'w-24': isCollapsed,
              'w-64': !isCollapsed,
            })}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {renderMenuBarContent()}
          </VerticalMenubar>
          <div
            role="button"
            tabIndex={0}
            className="absolute top-0 z-50 flex h-12 w-full cursor-pointer items-center justify-end bg-transparent bg-opacity-40 px-4"
            onClick={toggleMenuBar}
            onKeyDown={(e) => e.key === 'Enter' && toggleMenuBar()}
          >
            <div className={cn('text-xl text-white', { 'rotate-180 transform': !isFixed })}>
              <FaChevronLeft />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default MenuBar;
