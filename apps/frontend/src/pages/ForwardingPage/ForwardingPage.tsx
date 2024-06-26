import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/shared/Button';
import { RoundArrowIcon } from '@/assets/layout';
import { findAppConfigByName } from '@/utils/common';
import useAppConfigsStore from '@/store/appConfigsStore';
import { toast, Toaster } from 'sonner';
import { getFromPathName } from '@libs/common/utils';

const ForwardingPage: React.FC = () => {
  const { t } = useTranslation();
  const { pathname } = useLocation();

  const [isForwarding, setIsForwaring] = useState(false);
  const [showIsForwarding, setShowIsForwarding] = useState(false);

  const { appConfigs } = useAppConfigsStore();

  const rootPathName = getFromPathName(pathname, 1);

  useEffect(() => {
    if (isForwarding) {
      setIsForwaring(false);
      const navigateToExternalPage = () => {
        const externalLink = findAppConfigByName(appConfigs, rootPathName)?.options.url;
        if (externalLink) {
          setShowIsForwarding(true);
          return window.open(externalLink, '_blank');
        }
        setShowIsForwarding(false);
        console.error(t('forwardingpage.missing_link'));
        return toast.error(t('forwardingpage.missing_link'));
      };
      navigateToExternalPage();
    }
    setIsForwaring(false);
  }, [isForwarding, rootPathName, appConfigs]);

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
            src={findAppConfigByName(appConfigs, rootPathName)?.icon}
            alt="icon"
          />
        </Button>
      </div>
      <h3>{showIsForwarding ? t('forwardingpage.description') : '\u00A0'}</h3>
      <Toaster />
    </div>
  );
};

export default ForwardingPage;
