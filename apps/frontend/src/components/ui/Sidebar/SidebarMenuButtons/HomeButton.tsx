import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MobileLogoIcon } from '@/assets/icons';
import { SIDEBAR_ICON_WIDTH } from '@/constants/style';

const HomeButton: React.FC = () => {
  const { t } = useTranslation();
  const { pathname } = useLocation();

  return (
    <div key="home">
      <NavLink
        to="/"
        className={`group relative right-0 top-0 z-[99] flex cursor-pointer items-center justify-end gap-4 border-b-2 border-ciLightGrey bg-black px-4 py-2 hover:bg-black hover:opacity-50 md:block md:px-2 ${pathname === '/' ? 'bg-black' : ''}`}
      >
        <p className="text-md font-bold md:hidden">{t('home')}</p>
        <img
          src={MobileLogoIcon}
          width={SIDEBAR_ICON_WIDTH}
          alt=""
        />
      </NavLink>
    </div>
  );
};

export default HomeButton;