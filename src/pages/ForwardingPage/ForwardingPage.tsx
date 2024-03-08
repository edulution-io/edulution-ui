import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLocalStorage } from 'usehooks-ts';
import { Button } from '@/components/shared/Button';
// import { BigBlueButtonLogo } from '@/assets/logos';

const ForwardingPage: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();

  const [isForwarded, setIsForwarded] = useState<boolean>(false);

  type ConfigType = {
    [key: string]: { linkPath: string; icon: string };
  };
  const [config] = useLocalStorage<ConfigType>('edu-config', {});

  useEffect(() => {
    if (isForwarded) {
      setIsForwarded(false);
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
    <div className="absolute right-[20%] top-[25%]">
      <div className="flex h-full flex-col items-center justify-center">
        <h2>{t('Sie werden jetzt weitergeleitet zu...')}</h2>
        <div className="py-0">
          <img
            src={config[location.pathname.split('/')[1]].icon}
            alt=""
            width="300px"
          />
        </div>
        <h3 className="pb-20">
          Die Anwendung öffnet sich in einem neuen Fenster. Es ist keine weitere Autorisierung nötig.
        </h3>
        <Button
          variant="btn-collaboration"
          onClick={() => {
            setIsForwarded((prevVal) => !prevVal);
          }}
        >
          Weiter
        </Button>
      </div>
    </div>
  );
};

export default ForwardingPage;
