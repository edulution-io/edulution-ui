import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DesktopLogo from '@/assets/logos/edulution-logo-long-colorfull.svg';
import MobileLogo from '@/assets/logos/edulution-logo-long-colorfull-white.svg';
import { useMediaQuery } from 'usehooks-ts';
import useUserStore from '@/store/userStore';
import { Button } from '../shared/Button';
import Avatar from '../shared/Avatar';

type HeaderProps = {
  isLogoShown: boolean;
};

const Header: React.FC<HeaderProps> = ({ isLogoShown }) => {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const navigate = useNavigate();
  const { isAuthenticated } = useUserStore();

  return (
    <div className="mb-3 pb-1">
      <div className="flex max-w-[1440px] items-center justify-between">
        <div className="flex items-center">
          {isLogoShown ? (
            <div className={`rounded-b-[8px] ${isDesktop ? 'mt-0 w-[250px] bg-white' : 'mt-3 w-[150px]'}`}>
              <Link to="/">
                <img
                  src={isDesktop ? DesktopLogo : MobileLogo}
                  alt="edulution"
                  className={isDesktop ? 'm-4' : 'm-1'}
                />
              </Link>
            </div>
          ) : null}
        </div>
        <Button
          className="mb-7"
          type="button"
          onClick={() => {
            navigate('user');
          }}
        >
          {isAuthenticated ? <Avatar /> : null}
        </Button>
      </div>
    </div>
  );
};

export default Header;
