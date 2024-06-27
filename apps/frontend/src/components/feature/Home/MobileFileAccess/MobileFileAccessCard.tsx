import React, { useState } from 'react';
import { Button } from '@/components/shared/Button';
import { AppleLogo } from '@/assets/icons';
import { Card, CardContent } from '@/components/shared/Card';
import { useTranslation } from 'react-i18next';
import MobileFileAccessSetupDialog from './MobileFileAccessSetupDialog';

const MobileFileAccess: React.FC = () => {
  const { t } = useTranslation();
  const [isMobileAccessOpen, setIsMobileAccessOpen] = useState(false);
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
              width="20px"
            />
            <p>{t('dashboard.mobileAccess.manual')}</p>
          </Button>
          {isMobileAccessOpen ? (
            <MobileFileAccessSetupDialog
              isOpen={isMobileAccessOpen}
              setIsOpen={setIsMobileAccessOpen}
            />
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
};
export default MobileFileAccess;
