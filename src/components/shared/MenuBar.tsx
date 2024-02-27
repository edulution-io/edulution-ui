import React from 'react';

import { MenubarMenu, MenubarSeparator, MenubarTrigger, VerticalMenubar } from '@/components/ui/menubar';
import MenuItem from '../../../datatypes/types';

interface BasicPageLayoutProps {
  menuItems: MenuItem[];
  title: string;
  logoImagePath: string;
}

const MenuBar: React.FC<BasicPageLayoutProps> = ({ menuItems, title, logoImagePath }) => (
  <div className="flex h-screen  overflow-hidden">
    <VerticalMenubar
      className="w-1/12"
      style={{ width: '10px' }}
    >
      <div className="bg-left_sideBar_background h-full overflow-y-auto text-white">
        <div className="flex w-full flex-col items-center justify-center pt-4">
          <img
            src={logoImagePath}
            alt=""
            className="h-16 w-16 object-contain "
          />
          <span className="mt-4 text-xl font-bold">{title}</span>
          <MenubarSeparator />
        </div>
        <MenubarMenu>
          <MenubarSeparator />
          {menuItems.map((item) => (
            <React.Fragment key={item.label}>
              <MenubarTrigger
                className="flex w-full cursor-pointer items-center px-4 py-4 hover:bg-blue-800"
                onClick={item.action}
              >
                <p className="mr-3 text-lg text-white" />
                <span className="font-medium">{item.label}</span>
              </MenubarTrigger>
              <MenubarSeparator />
            </React.Fragment>
          ))}
        </MenubarMenu>
      </div>
    </VerticalMenubar>
  </div>
);

export default MenuBar;
