import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/shared/Button';
import Toaster from '@/components/ui/Sonner';
import useUserStore from '@/store/UserStore/UserStore';
import Switch from '@/components/ui/Switch';
import SetupMfaDialog from './SetupMfaDialog';

const AddMfaForm: React.FC = () => {
  const { t } = useTranslation();
  const { user, getUser } = useUserStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const setupMfa = searchParams.get('setupMfa');
  const mfaEnabled = user?.mfaEnabled || false;

  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (user) {
      void getUser(user.username);
    }
  }, []);

  useEffect(() => {
    if (checked && !mfaEnabled) {
      setSearchParams(new URLSearchParams('setupMfa=true'));
    } else if (checked && mfaEnabled) setSearchParams(new URLSearchParams(''));
  }, [checked, mfaEnabled]);

  const handleSetMfaEnabled = async (totp: string) => {
    try {
      const totpValid = await Promise.resolve(() => true);
      if (!totpValid) return;
      console.info(totp);
      // await updateUserInfo(user, { mfaEnabled: true } as UserInfo);
      setChecked(true);
    } catch (error) {
      console.error(error);
    } finally {
      setSearchParams(new URLSearchParams(''));
    }
  };

  const dialogProps: {
    isOpen: boolean;
    handleSetMfaEnabled: (otp: string) => Promise<void>;
  } = {
    isOpen: setupMfa === 'true',
    handleSetMfaEnabled,
  };

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
          className="border-white bg-white"
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
      <SetupMfaDialog {...dialogProps} />
      <Toaster />
    </>
  );
};

export default AddMfaForm;
