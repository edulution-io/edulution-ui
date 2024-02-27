import React from 'react';

import MainLayout from "@/components/layout/MainLayout";
import {MenubarMenu, MenubarSeparator, MenubarTrigger, VerticalMenubar} from "@/components/ui/menubar";
import MenuItem from "../../../datatypes/types";


interface BasicPageLayoutProps {
    children: React.ReactNode;
    menuItems: MenuItem[];
    title: string
    logoImagePath: string
}

const BasicPageLayout: React.FC<BasicPageLayoutProps> = ({children, menuItems, title, logoImagePath}) => (
        <MainLayout showLogo={false}>
            <div className="flex  h-screen  overflow-hidden">
                <VerticalMenubar className="w-1/12" style={{ width: '10px' }}>
                    <div className="bg-left_sideBar_background text-white h-full overflow-y-auto">
                        <div className="flex flex-col items-center justify-center w-full pt-4">
                            <img src={logoImagePath} alt=""
                                 className="w-16 h-16 object-contain "/>
                            <span className="text-xl font-bold mt-4">{title}</span>
                            <MenubarSeparator/>
                        </div>
                        <MenubarMenu>
                            <MenubarSeparator/>
                            {menuItems.map((item) => (
                                <React.Fragment key={item.label}>
                                    <MenubarTrigger
                                        className="flex items-center px-4 py-4 cursor-pointer hover:bg-blue-800 w-full"
                                        onClick={item.action}
                                    >
                                        <p className="text-white text-lg mr-3"/>
                                        <span className="font-medium">{item.label}</span>
                                    </MenubarTrigger>
                                    <MenubarSeparator/>
                                </React.Fragment>
                            ))}
                        </MenubarMenu>
                    </div>
                </VerticalMenubar>
                <div className="flex-1 w-full h-full">
                    <p className="text-red-700">erjfiorewhnireöghoh</p>
                    {children}
                </div>
            </div>
        </MainLayout>
    );

export default BasicPageLayout;

