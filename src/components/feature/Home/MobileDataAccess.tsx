import React from 'react';
import { Button } from '@/components/shared/Button';
import { AppleLogo } from '@/assets/icons';
import { CardContent, Card } from '@/components/shared/Card';
import { useTranslation } from 'react-i18next';

const MobileDataAccess = () => {
  const { t } = useTranslation();

  return (
    <Card variant="infrastructure">
      <CardContent>
        <div className="flex flex-col gap-6">
          <h4 className="text-md font-bold">{t('dashboard.mobileAccess.title')}</h4>
          <p>{t('dashboard.mobileAccess.content')}</p>
          <Button
            variant="btn-infrastructure"
            size="lg"
          >
            <img
              src={AppleLogo}
              alt="AppleLogo"
              width="30px"
            />
            <p>{t('dashboard.mobileAccess.manual')}</p>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
export default MobileDataAccess;
