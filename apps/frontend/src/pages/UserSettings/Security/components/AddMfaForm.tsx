/*
 * LICENSE
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

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
