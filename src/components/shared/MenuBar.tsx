import React, { useState } from 'react';

import useMenuBarConfig from '@/hooks/useMenuBarConfig';
import { MenubarMenu, MenubarSeparator, MenubarTrigger, VerticalMenubar } from '@/components/ui/menubar';

import cn from '@/lib/utils';

const MenuBar: React.FC = () => {
  const menuBarEntries = useMenuBarConfig();
  const [isSelected, setIsSelected] = useState('');

  return (
    <VerticalMenubar className="flex h-screen w-full overflow-hidden bg-black bg-opacity-40">
      <div className="w-full">
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
                className={cn(
                  'transition-color flex w-full cursor-pointer items-center gap-5 px-10 py-1',
                  menuBarEntries.color,
                  isSelected === item.label ? menuBarEntries.color.split(':')[1] : '',
                )}
                onClick={() => {
                  item.action();
                  setIsSelected(item.label);
                }}
              >
                <img
                  src={item.icon}
                  alt=""
                  className="h-12 w-12 object-contain "
                />
                <p>{item.label}</p>
              </MenubarTrigger>
              <MenubarSeparator />
            </React.Fragment>
          ))}
        </MenubarMenu>
      </div>
    </VerticalMenubar>
  );
};

export default MenuBar;
