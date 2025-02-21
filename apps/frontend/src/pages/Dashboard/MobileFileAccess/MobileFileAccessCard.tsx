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
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/shared/Button';
import { AppleLogo } from '@/assets/icons';
import { Card, CardContent } from '@/components/shared/Card';
import MobileFileAccessSetupDialog from './MobileFileAccessSetupDialog';

const MobileFileAccess: React.FC = () => {
  const { t } = useTranslation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  return (
    <Card
      variant="security"
      className="h-full"
    >
      <CardContent>
        <h4 className="mb-6 font-bold">{t('dashboard.mobileAccess.title')}</h4>
        <p className="mb-6">{t('dashboard.mobileAccess.content')}</p>
        <Button
          className="bottom-6"
          variant="btn-infrastructure"
          size="lg"
          onClick={() => setIsDialogOpen(!isDialogOpen)}
        >
          <img
            src={AppleLogo}
            alt="AppleLogo"
            width="20px"
          />
          <p>{t('dashboard.mobileAccess.manual')}</p>
        </Button>
        {isDialogOpen ? (
          <MobileFileAccessSetupDialog
            isOpen={isDialogOpen}
            setIsOpen={setIsDialogOpen}
          />
        ) : null}
      </CardContent>
    </Card>
  );
};

export default MobileFileAccess;
