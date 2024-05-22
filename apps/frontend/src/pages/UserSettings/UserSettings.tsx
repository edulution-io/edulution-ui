import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import useUserStore from '@/store/userStore';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/shared/Button';
import { UserInfo } from '@/datatypes/types';
import Switch from '@/components/ui/Switch';
import { toast } from 'sonner';
import Toaster from '@/components/ui/Sonner';
import SetupQrCodeDialog from './UserSettingsDialog/SetupQrCodeDialog';

const UserSettings: React.FC = () => {
  const { t } = useTranslation();
  const { user, postSetupTotp, getUserInfoFromDb, updateUserInfo } = useUserStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const setupMfa = searchParams.get('setupMfa');

  const [checked, setChecked] = useState(false);
  const [mfaEnabled, setMfaEnabled] = useState(false);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const userInfoQuery = (await getUserInfoFromDb(user)) as UserInfo;
        setMfaEnabled(userInfoQuery.mfaEnabled);
        setChecked(userInfoQuery.mfaEnabled);
      } catch (error) {
        console.error(error);
      }
    };
    // eslint-disable-next-line no-void
    void fetchUserInfo();
  }, [user, checked]);

  useEffect(() => {
    if (checked && !mfaEnabled) {
      setSearchParams(new URLSearchParams('setupMfa=true'));
    } else if (checked && mfaEnabled) setSearchParams(new URLSearchParams(''));
  }, [checked, mfaEnabled]);

  const handleSetMfaEnabled = async (otp: string) => {
    try {
      const totpValid = await postSetupTotp(otp);

      if (!totpValid) return;
      await updateUserInfo(user, { mfaEnabled: true } as UserInfo);
      setMfaEnabled(true);
      setChecked(true);
      toast.success(t('auth.totp.setup.success'));
    } catch (error) {
      toast.error(t('auth.totp.invalid'));
    }
  };

  const dialogProps: {
    isOpen: boolean;
    user: string;
    setSearchParams: (setParams: URLSearchParams | ((prevParams: URLSearchParams) => URLSearchParams)) => void;
    handleSetMfaEnabled: (otp: string) => Promise<void>;
  } = {
    isOpen: setupMfa === 'true',
    user,
    setSearchParams,
    handleSetMfaEnabled,
  };

  const handleRevertMfaSetup = async () => {
    setChecked(false);
    await updateUserInfo(user, { mfaEnabled: false } as UserInfo)
      .then(() => toast.success(t('settings.appconfig.update.success')))
      .catch(() => toast.error(t('settings.appconfig.update.failed')));
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
      <SetupQrCodeDialog {...dialogProps} />
      <Toaster />
    </>
  );
};

export default UserSettings;
