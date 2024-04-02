import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLocalStorage } from 'usehooks-ts';
import { Button } from '@/components/shared/Button';
import { RoundArrowIcon } from '@/assets/layout';
import { ConfigType } from '@/datatypes/types';
import { getFromPathName } from '@/utils/common';

const ForwardingPage: React.FC = () => {
  const { t } = useTranslation();
  const { pathname } = useLocation();

  const [isForwarding, setIsForwaring] = useState(false);
  const [showIsForwarding, setShowIsForwarding] = useState(false);

  const [config] = useLocalStorage<ConfigType>('edu-config', {});
  const rootPathName = getFromPathName(pathname, 1);

  useEffect(() => {
    if (isForwarding) {
      setIsForwaring(false);
      setShowIsForwarding(true);
      const navigateToExternalPage = () => {
        const externalLink = config[rootPathName]?.linkPath;
        if (externalLink) {
          window.open(externalLink, '_blank');
        }
      };
      navigateToExternalPage();
    }
    setIsForwaring(false);
  }, [isForwarding]);

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
            src={config[rootPathName].icon}
            alt="icon"
          />
        </Button>
      </div>
      <h3>{showIsForwarding ? t('forwardingpage.description') : '\u00A0'}</h3>
    </div>
  );
};

export default ForwardingPage;
