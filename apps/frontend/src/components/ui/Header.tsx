import React from 'react';
import { Link } from 'react-router-dom';
import DesktopLogo from '@/assets/logos/edulution-logo-long-colorfull.svg';
import MobileLogo from '@/assets/logos/edulution-logo-long-colorfull-white.svg';
import { useMediaQuery } from 'usehooks-ts';

type HeaderProps = {
  isLogoShown: boolean;
};

const Header: React.FC<HeaderProps> = ({ isLogoShown }) => {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  return (
    <div className="mb-3 pb-1">
      <div className="flex max-w-[1440px] justify-between align-middle">
        {isLogoShown ? (
          <div className={`w-[150px] rounded-b-[8px] ${isDesktop ? 'mt-0 w-[250px] bg-white' : 'mt-3'}`}>
            <Link to="/">
              <img
                src={isDesktop ? DesktopLogo : MobileLogo}
                alt="edulution"
                className={isDesktop ? 'm-4' : 'm-1'}
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
