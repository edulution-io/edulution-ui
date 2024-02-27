import React, {PropsWithChildren} from 'react';
import {Outlet, useLocation} from 'react-router-dom';
import Header from '@/components/ui/Header';
import Footer from '@/components/ui/Footer';
import Sidebar from '../ui/Sidebar';

const MainLayout: React.FC<PropsWithChildren> = () => {

        return (
            <>
                <Sidebar/>
                <div className="bg-[#3B3B3B]">
                    <div className="flex min-h-[100vh] flex-col">
                        <Header/>
                        <div className="flex-1">
                            <Outlet/>
                        </div>
                        <Footer/>
                    </div>
                </div>
            </>
        )
    }
;

export default MainLayout;
