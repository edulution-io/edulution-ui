/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
 *
 * This software is dual-licensed under the terms of:
 *
 * 1. The GNU Affero General Public License (AGPL-3.0-or-later), as published by the Free Software Foundation.
 *    You may use, modify and distribute this software under the terms of the AGPL, provided that you comply with its conditions.
 *
 *    A copy of the license can be found at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * OR
 *
 * 2. A commercial license agreement with Netzint GmbH. Licensees holding a valid commercial license from Netzint GmbH
 *    may use this software in accordance with the terms contained in such written agreement, without the obligations imposed by the AGPL.
 *
 * If you are uncertain which license applies to your use case, please contact us at info@netzint.de for clarification.
 */

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/shared/Button';
import useUserStore from '@/store/UserStore/useUserStore';
import Switch from '@/components/ui/Switch';

const AddMfaForm: React.FC = () => {
  const { t } = useTranslation();
  const { user, isSetTotpDialogOpen, setIsSetTotpDialogOpen, getUser, disableTotp } = useUserStore();
  const { username = '', mfaEnabled = false } = user ?? {};
  const [checked, setChecked] = useState(mfaEnabled);

  useEffect(() => {
    if (mfaEnabled) {
      setIsSetTotpDialogOpen(false);
    }
    setChecked(mfaEnabled);
  }, [user, mfaEnabled]);

  useEffect(() => {
    if (checked) {
      setIsSetTotpDialogOpen(!isSetTotpDialogOpen !== mfaEnabled);
    }
  }, [checked]);

  useEffect(() => {
    if (!isSetTotpDialogOpen) {
      void getUser(username);
    }
  }, [isSetTotpDialogOpen]);

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
        <div className="my-4 flex justify-end">
          <Button
            variant="btn-security"
            size="lg"
            onClick={() => handleRevertMfaSetup()}
            className={mfaEnabled && checked !== mfaEnabled && !isSetTotpDialogOpen ? '' : 'invisible'}
          >
            {t('common.save')}
          </Button>
        </div>
      </div>
    </>
  );
};

export default AddMfaForm;
