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
