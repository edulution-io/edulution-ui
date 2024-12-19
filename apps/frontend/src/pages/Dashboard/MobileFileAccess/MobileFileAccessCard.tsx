import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/shared/Button';
import { AppleLogo } from '@/assets/icons';
import { Card, CardContent } from '@/components/shared/Card';
import MobileFileAccessSetupDialog from './MobileFileAccessSetupDialog';

const MobileFileAccess: React.FC = () => {
  const { t } = useTranslation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  return (
    <Card variant="security">
      <CardContent>
        <h4 className="mb-6 font-bold">{t('dashboard.mobileAccess.title')}</h4>
        <p className="mb-6">{t('dashboard.mobileAccess.content')}</p>
        <Button
          className="bottom-6"
          variant="btn-infrastructure"
          size="lg"
          onClick={() => setIsDialogOpen(!isDialogOpen)}
        >
          <img
            src={AppleLogo}
            alt="AppleLogo"
            width="20px"
          />
          <p>{t('dashboard.mobileAccess.manual')}</p>
        </Button>
        {isDialogOpen ? (
          <MobileFileAccessSetupDialog
            isOpen={isDialogOpen}
            setIsOpen={setIsDialogOpen}
          />
        ) : null}
      </CardContent>
    </Card>
  );
};

export default MobileFileAccess;
