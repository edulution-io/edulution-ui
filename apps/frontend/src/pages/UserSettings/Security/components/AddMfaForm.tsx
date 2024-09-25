import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/shared/Button';
import Toaster from '@/components/ui/Sonner';
import useUserStore from '@/store/UserStore/UserStore';
import Switch from '@/components/ui/Switch';
import SetupMfaDialog from './SetupMfaDialog';

const AddMfaForm: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useUserStore();
  const mfaEnabled = user?.mfaEnabled || false;
  const [isOpen, setIsOpen] = useState(false);

  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (checked && !mfaEnabled) {
      setIsOpen(true);
    } else if (checked && mfaEnabled) {
      setIsOpen(false);
    }
  }, [checked, mfaEnabled]);

  const handleRevertMfaSetup = async () => {
    // setChecked(false);
    // await updateUserInfo(user, { mfaEnabled: false } as UserInfo)
    //   .then(() => toast.success(t('settings.appconfig.update.success')))
    //   .catch(() => toast.error(t('settings.appconfig.update.failed')));
  };

  return (
    <>
      <h3>{t('usersettings.config.mfa')}</h3>
      <div className="mb-4 flex items-center justify-between">
        <Switch
          className="border-background bg-foreground"
          checked={checked}
          defaultChecked={mfaEnabled}
          onCheckedChange={(chk) => {
            setChecked(chk);
          }}
        />
        <Button
          variant="btn-collaboration"
          size="sm"
          onClick={() => handleRevertMfaSetup()}
        >
          {t('common.revert')}
        </Button>
      </div>
      <SetupMfaDialog
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      />
      <Toaster />
    </>
  );
};

export default AddMfaForm;
