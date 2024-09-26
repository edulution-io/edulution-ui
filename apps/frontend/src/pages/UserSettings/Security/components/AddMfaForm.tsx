import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdCheck } from 'react-icons/md';
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

  return (
    <>
      <h3>{t('usersettings.config.mfa')}</h3>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Switch
            className="border-background bg-foreground"
            checked={checked}
            defaultChecked={mfaEnabled}
            disabled={mfaEnabled}
            onCheckedChange={(chk) => {
              setChecked(chk);
            }}
          />
          {mfaEnabled ? <MdCheck className="h-6 w-6 text-ciLightGreen" /> : null}
        </div>
        {mfaEnabled ? (
          <Button
            variant="btn-collaboration"
            size="sm"
            onClick={() => handleRevertMfaSetup()}
          >
            {t('common.revert')}
          </Button>
        ) : null}
      </div>
      <SetupMfaDialog
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      />
    </>
  );
};

export default AddMfaForm;
