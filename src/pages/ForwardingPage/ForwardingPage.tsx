import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLocalStorage } from 'usehooks-ts';
import { Button } from '@/components/shared/Button';
import { HexagonIcon, RoundArrowIcon } from '@/assets/layout';
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
        <h2 className="pb-20">{t('Sie werden jetzt weitergeleitet zu...')}</h2>
        <div className="absolute right-[70%] top-[18%] w-[400px]">
          <img
            src={RoundArrowIcon}
            alt=""
            width="400px"
            style={{ width: '100%' }}
          />
        </div>
        <div className="absolute right-[32%] top-[18%] w-[400px]">
          <img
            src={HexagonIcon}
            alt=""
            width="400px"
            style={{ width: '100%' }}
          />
        </div>
        <div>
          <img
            src={config[location.pathname.split('/')[1]].icon}
            alt=""
            width="400px"
            style={{ width: '100%' }}
          />
        </div>
        <h3 className="pb-30 pt-20">
          Die Anwendung öffnet sich in einem neuen Fenster. Es ist keine weitere Autorisierung nötig.
        </h3>
        <Button
          variant="btn-collaboration"
          size="lg"
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
