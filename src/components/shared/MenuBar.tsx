import React from 'react';

import { MenubarMenu, MenubarSeparator, MenubarTrigger, VerticalMenubar } from '@/components/ui/menubar';
import MenuItem from '@/datatypes/types';

interface MenuBarProps {
  menuItems: MenuItem[];
  title: string;
  icon: string;
  color: string;
}

const MenuBar: React.FC<MenuBarProps> = ({ menuItems, title, icon, color }) => {
  const hoverColor = `hover:${color}`;

  return (
    <div className="flex h-screen overflow-hidden">
      <VerticalMenubar className=" bg-black bg-opacity-10 ">
        <div className="text-white">
          <div className="flex flex-col items-center justify-center py-5 pt-4">
            <img
              src={icon}
              alt=""
              className="h-20 w-20 object-contain"
            />
            <div className="mt-4 text-lg font-bold">{title}</div>
          </div>
          <MenubarSeparator />
          <MenubarMenu>
            {menuItems.map((item) => (
              <React.Fragment key={item.label}>
                <MenubarTrigger
                  className={`${hoverColor} flex w-full cursor-pointer items-center gap-5 px-10 py-1`}
                  onClick={item.action}
                >
                  <img
                    src={item.icon}
                    alt=""
                    className="h-12 w-12 object-contain "
                  />
                  <div className="text-base">{item.label}</div>
                </MenubarTrigger>
                <MenubarSeparator />
              </React.Fragment>
            ))}
          </MenubarMenu>
        </div>
      </VerticalMenubar>
    </div>
  );
};

export default MenuBar;
