import React, { useState } from 'react';
import { Button } from '@/components/shared/Button';
import { AppleLogo } from '@/assets/icons';
import { Card, CardContent } from '@/components/shared/Card';
import { useTranslation } from 'react-i18next';
import MobileAccessIntroduction from '@/components/feature/Home/QRCode/MobileAccessIntroduction';

const MobileDataAccess = () => {
  const { t } = useTranslation();
  const [isMobileAccessOpen, setIsMobileAccessOpen] = useState<boolean>(false);
  return (
    <Card variant="security">
      <CardContent>
        <div className="flex flex-col gap-6">
          <h4 className="text-md font-bold">{t('dashboard.mobileAccess.title')}</h4>
          <p>{t('dashboard.mobileAccess.content')}</p>
          <Button
            variant="btn-infrastructure"
            size="lg"
            onClick={() => setIsMobileAccessOpen(!isMobileAccessOpen)}
          >
            <img
              src={AppleLogo}
              alt="AppleLogo"
              width="30px"
            />
            <p>{t('dashboard.mobileAccess.manual')}</p>
          </Button>
          <MobileAccessIntroduction
            isMobileAccessIntroductionOpen={isMobileAccessOpen}
            setIsMobileAccessIntroductionOpen={setIsMobileAccessOpen}
          />
        </div>
      </CardContent>
    </Card>
  );
};
export default MobileDataAccess;
