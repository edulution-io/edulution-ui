import React from 'react';
import {Link, useLocation} from 'react-router-dom';
import DesktopLogo from '@/assets/logos/edulution-logo-long-colorfull.svg';
import MobileLogo from '@/assets/logos/edulution-logo-long-colorfull-white.svg';
import {useMediaQuery} from 'usehooks-ts';

const Header: React.FC = () => {
    const location = useLocation()
    const showLogo = location.pathname === "/"

    const isDesktop = useMediaQuery('(min-width: 768px)');
    return (
        <div className="mb-3 pb-1">
            <div className="flex max-w-[1440px] justify-between align-middle">
                {showLogo ? (
                    <div className={`w-[150px] rounded-b-[8px] ${isDesktop ? 'mt-0 w-[250px] bg-white' : 'mt-4'}`}>
                        <Link to="/">
                            <img
                                src={isDesktop ? DesktopLogo : MobileLogo}
                                alt="edulution"
                            />
                        </Link>
                    </div>
                ) : null}
                {/* Add your navigation links or other content here */}
            </div>
        </div>
    );
};

export default Header;
