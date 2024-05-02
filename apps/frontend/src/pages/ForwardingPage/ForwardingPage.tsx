import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/shared/Button';
import { RoundArrowIcon } from '@/assets/layout';
import { getFromPathName, findEntryByName } from '@/utils/common';
import useAppDataStore from '@/store/appDataStore';

const ForwardingPage: React.FC = () => {
  const { t } = useTranslation();
  const { pathname } = useLocation();

  const [isForwarding, setIsForwaring] = useState(false);
  const [showIsForwarding, setShowIsForwarding] = useState(false);

  const { config } = useAppDataStore();

  const rootPathName = getFromPathName(pathname, 1);

  useEffect(() => {
    if (isForwarding) {
      setIsForwaring(false);
      setShowIsForwarding(true);
      const navigateToExternalPage = () => {
        const externalLink = findEntryByName(config, rootPathName)?.linkPath as string;
        if (externalLink) {
          window.open(externalLink, '_blank');
        }
      };
      navigateToExternalPage();
    }
    setIsForwaring(false);
  }, [isForwarding, rootPathName, config]);

  return (
    <div className="grid h-[80%] items-center justify-center">
      <h2 className="text-center">{t('forwardingpage.action')}</h2>
      <div className="mt-20 flex justify-center">
        <img
          className="hidden md:flex"
          src={RoundArrowIcon}
          alt=""
          width="200px"
        />
        <Button
          type="button"
          variant="btn-hexagon"
          onClick={() => {
            setIsForwaring((prevVal) => !prevVal);
          }}
        >
          <img
            className="m-10 w-[200px] md:m-[20] md:w-[200px]"
            src={findEntryByName(config, rootPathName)?.icon}
            alt="icon"
          />
        </Button>
      </div>
      <h3>{showIsForwarding ? t('forwardingpage.description') : '\u00A0'}</h3>
    </div>
  );
};

export default ForwardingPage;
