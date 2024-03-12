import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLocalStorage } from 'usehooks-ts';
import { Button } from '@/components/shared/Button';
import { RoundArrowIcon } from '@/assets/layout';
import { ConfigType } from '@/datatypes/types';

const ForwardingPage: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();

  const [isForwarded, setIsForwarded] = useState<boolean>(false);
  const [isShowForwarded, setShowIsForwarded] = useState(false);

  const [config] = useLocalStorage<ConfigType>('edu-config', {});

  useEffect(() => {
    if (isForwarded) {
      setIsForwarded(false);
      setShowIsForwarded(true);
      const navigateToExternalPage = () => {
        const path = location.pathname.split('/')[1];
        const externalLink = config[path]?.linkPath;
        if (externalLink) {
          window.open(externalLink, '_blank');
        }
      };
      navigateToExternalPage();
    }
    setIsForwarded(false);
  }, [isForwarded]);

  return (
    <div className="grid h-[80%] items-center justify-center ">
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
            setIsForwarded((prevVal) => !prevVal);
          }}
        >
          <img
            className="m-10 w-[200px] md:m-[20] md:w-[200px]"
            src={config[location.pathname.split('/')[1]].icon}
            alt="icon"
            // width="200px"
          />
        </Button>
      </div>
      <div>
        {isShowForwarded ? <h3 className="hidden text-center md:flex">{t('forwardingpage.description')}</h3> : null}
      </div>
    </div>
  );
};

export default ForwardingPage;
