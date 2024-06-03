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

  if (!isLogoShown) {
    return null;
  }

  return (
    <div className="mb-3 flex pb-1">
      <div className={`rounded-b-[8px] ${isDesktop ? 'mt-0 w-[250px] bg-white' : 'mt-3 w-[150px]'}`}>
        <Link to="/">
          <img
            src={isDesktop ? DesktopLogo : MobileLogo}
            alt="edulution"
            className={isDesktop ? 'm-4' : 'm-1'}
          />
        </Link>
      </div>
    </div>
  );
};

export default Header;
