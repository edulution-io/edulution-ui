import React from 'react';
import { Link } from 'react-router-dom';
import DesktopLogo from '@/assets/logos/edulution-logo-long-colorfull.svg';
import MobileLogo from '@/assets/logos/edulution-logo-long-colorfull-white.svg';
import { useMediaQuery } from 'usehooks-ts';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';

type HeaderProps = {
  isLogoShown: boolean;
};

const Header: React.FC<HeaderProps> = ({ isLogoShown }) => {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const { t } = useTranslation();
  const auth = useAuth();

  if (!isLogoShown) {
    return null;
  }

  return (
    <div className="mb-3 flex items-center pb-1">
      <div className={`rounded-b-[8px] ${isDesktop ? 'mt-0 w-[250px] bg-white' : 'mt-3 w-[150px]'}`}>
        <Link to="/">
          <img
            src={isDesktop ? DesktopLogo : MobileLogo}
            alt="edulution"
            className={isDesktop ? 'm-4' : 'm-1'}
          />
        </Link>
      </div>
      <h2 className="ml-4 items-center text-2xl font-bold text-white">
        {t('heading', {
          givenName: auth?.user?.profile?.given_name || '-',
          familyName: auth?.user?.profile?.family_name || '-',
        })}
      </h2>
    </div>
  );
};

export default Header;
