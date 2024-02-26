import React from 'react';

import {MainLayout} from "@/components/layout/MainLayout.tsx";
import {MenubarMenu, MenubarSeparator, MenubarTrigger, VerticalMenubar} from "@/components/ui/menubar.tsx";
import {MenuItem} from "../../../datatypes/types.ts";

interface BasicPageLayoutProps {
    children: React.ReactNode;
    menuItems: MenuItem[];
    title: string
    logoImagePath: string
}

export const BasicPageLayout: React.FC<BasicPageLayoutProps> = ({children, menuItems, title, logoImagePath}) => {
    return (
        <MainLayout showLogo={false}>
            <div className="flex  h-screen  overflow-hidden">
                <VerticalMenubar className="w-1/12" style={{ width: '10px' }}>
                    <div className="bg-left_sideBar_background text-white h-full overflow-y-auto">
                        <div className="flex flex-col items-center justify-center w-full pt-4">
                            <img src={logoImagePath} alt=""
                                 className="w-16 h-16 object-contain "/> {/* Adjust the size as needed */}
                            <span className="text-xl font-bold mt-4">{title}</span>
                            <MenubarSeparator/>
                        </div>
                        <MenubarMenu>
                            <MenubarSeparator/>
                            {menuItems.map((item, index) => (
                                <React.Fragment key={index}>
                                    <MenubarTrigger
                                        className="flex items-center px-4 py-4 cursor-pointer hover:bg-blue-800 w-full"
                                        onClick={item.action}
                                    >
                                        {<p className="text-white text-lg mr-3"/>}
                                        <span className="font-medium">{item.label}</span>
                                    </MenubarTrigger>
                                    <MenubarSeparator/>
                                </React.Fragment>
                            ))}
                        </MenubarMenu>
                    </div>
                </VerticalMenubar>
                <div className="flex-1 w-full h-full">
                    {children}
                </div>
            </div>
        </MainLayout>
    );
};

