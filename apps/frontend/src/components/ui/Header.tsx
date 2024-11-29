import React from 'react';
import { Link } from 'react-router-dom';
import DesktopLogo from '@/assets/logos/edulution.io_USER INTERFACE.svg';
import MobileLogo from '@/assets/logos/edulution.io_USER INTERFACE-small.svg';
import { useTranslation } from 'react-i18next';
import useIsMobileView from '@/hooks/useIsMobileView';
import useUserStore from '@/store/UserStore/UserStore';
import { BLANK_LAYOUT_HEADER_ID } from '@libs/common/constants/pageElementIds';

interface HeaderProps {
  hideHeadingText?: boolean;
}

const Header: React.FC<HeaderProps> = ({ hideHeadingText = false }: HeaderProps) => {
  const isMobileView = useIsMobileView();
  const { t } = useTranslation();
  const { user } = useUserStore();
  const getHeadingText = () => {
    if (isMobileView || hideHeadingText) return null;
    return (
      <h2
        id={BLANK_LAYOUT_HEADER_ID}
        className="ml-4 items-center text-2xl font-bold text-white"
      >
        {t('heading', {
          givenName: user?.firstName || '-',
          familyName: user?.lastName || '-',
        })}
      </h2>
    );
  };

  return (
    <div
      id={BLANK_LAYOUT_HEADER_ID}
      className="mb-3 flex items-center pb-1"
    >
      <div className={`rounded-b-[8px] ${isMobileView ? 'mt-3 w-[150px]' : 'mt-0 w-[250px] bg-white'}`}>
        <Link to="/">
          <img
            src={isMobileView ? MobileLogo : DesktopLogo}
            alt="edulution"
            className={isMobileView ? 'm-1' : 'm-4'}
          />
        </Link>
      </div>
      {getHeadingText()}
    </div>
  );
};

export default Header;
