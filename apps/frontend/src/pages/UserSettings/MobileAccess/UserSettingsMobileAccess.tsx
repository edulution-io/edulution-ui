import React, { useState } from 'react';
import { MobileDevicesIcon } from '@/assets/icons';
import NativeAppHeader from '@/components/layout/NativeAppHeader';
import MobileFileAccessSetupDialog from '@/pages/Dashboard/MobileFileAccess/MobileFileAccessSetupDialog';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/shared/Button';

const UserSettingsMobileAccess: React.FC = () => {
  const { t } = useTranslation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  return (
    <>
      <NativeAppHeader
        title={t('usersettings.mobileAccess.title')}
        description={t('usersettings.mobileAccess.description')}
        iconSrc={MobileDevicesIcon}
      />
      <div className="mt-4 flex justify-end">
        <Button
          variant="btn-security"
          size="lg"
          onClick={() => setIsDialogOpen(!isDialogOpen)}
        >
          <p>{t('dashboard.mobileAccess.manual')}</p>
        </Button>
      </div>
      {isDialogOpen ? (
        <MobileFileAccessSetupDialog
          isOpen={isDialogOpen}
          setIsOpen={setIsDialogOpen}
        />
      ) : null}
    </>
  );
};

export default UserSettingsMobileAccess;
