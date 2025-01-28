import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/shared/Button';
import useUserStore from '@/store/UserStore/UserStore';
import Switch from '@/components/ui/Switch';
import SetupMfaDialog from './SetupMfaDialog';

const AddMfaForm: React.FC = () => {
  const { t } = useTranslation();
  const { user, getUser, disableTotp } = useUserStore();
  const { username = '', mfaEnabled = false } = user ?? {};
  const [isOpen, setIsOpen] = useState(false);
  const [checked, setChecked] = useState(mfaEnabled);

  useEffect(() => {
    if (mfaEnabled) {
      setIsOpen(false);
    }
    setChecked(mfaEnabled);
  }, [user, mfaEnabled]);

  useEffect(() => {
    if (checked) {
      setIsOpen((prev) => !prev !== mfaEnabled);
    }
  }, [checked]);

  useEffect(() => {
    if (!isOpen) {
      void getUser(username);
    }
  }, [isOpen]);

  const handleRevertMfaSetup = async () => {
    await disableTotp();
  };

  const switchId = 'mfa-switch';

  return (
    <>
      <h3 className="text-background">{t('usersettings.config.mfa')}</h3>
      <div className="flex flex-col">
        <div className="my-4 flex justify-start">
          <div className="text-background">
            {t('usersettings.config.mfaInfo')}{' '}
            <span className="font-bold">{t(`usersettings.config.${checked ? 'enabled' : 'disabled'}`)}</span>.
          </div>
        </div>
        <div className="flex justify-end">
          <label
            htmlFor={switchId}
            className="mr-2 cursor-pointer"
          >
            {t(`usersettings.config.${checked ? 'disable' : 'enable'}`)}
          </label>
          <Switch
            id={switchId}
            checked={checked}
            defaultChecked={mfaEnabled}
            onCheckedChange={(chk) => {
              setChecked(chk);
            }}
          />
        </div>
        <div className="flex justify-end">
          <Button
            variant="btn-security"
            size="lg"
            onClick={() => handleRevertMfaSetup()}
            className={mfaEnabled && checked !== mfaEnabled && !isOpen ? '' : 'invisible'}
          >
            {t('common.save')}
          </Button>
        </div>
      </div>

      <SetupMfaDialog
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      />
    </>
  );
};

export default AddMfaForm;
