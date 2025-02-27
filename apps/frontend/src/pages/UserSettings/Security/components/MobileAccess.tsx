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
import MobileFileAccessSetupDialog from '@/pages/Dashboard/MobileFileAccess/MobileFileAccessSetupDialog';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/shared/Button';

const MobileAccess: React.FC = () => {
  const { t } = useTranslation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  return (
    <>
      <h3>{t('usersettings.mobileAccess.title')}</h3>
      <div className="flex flex-col">
        <div className="my-4 flex justify-start">
          <div className="text-background">
            <span className="font-bold">{t('usersettings.mobileAccess.description')}</span>.
          </div>
        </div>
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
      </div>
    </>
  );
};

export default MobileAccess;
