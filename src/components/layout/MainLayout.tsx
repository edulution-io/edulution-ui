import React from 'react';
import {Outlet} from 'react-router-dom';
import Header from '@/components/ui/Header';
import Footer from '@/components/ui/Footer';
import Sidebar from '../ui/Sidebar';

interface MainLayoutProps {
    showLogo: boolean,
    children: React.ReactNode
}

const MainLayout: React.FC<MainLayoutProps> = ({showLogo, children}) => (
    <>
        <Sidebar/>
        <div className="bg-[#3B3B3B]">
            <div className="flex min-h-[100vh] flex-col px-5 lg:px-20">
                {showLogo ? (
                        <Header/>
                    ) :
                    <p/>}
            </div>
            <div>
                {children}
            </div>
            <div className="flex-1">
                <Outlet/>
            </div>

        </div>
        <Footer/>
    </>
);

export default MainLayout;
