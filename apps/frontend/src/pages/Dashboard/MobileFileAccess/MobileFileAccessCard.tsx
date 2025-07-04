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

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/shared/Button';
import { AppleLogo } from '@/assets/icons';
import { Card, CardContent } from '@/components/shared/Card';
import { useNavigate } from 'react-router-dom';
import { USER_SETTINGS_MOBILE_ACCESS_PATH } from '@libs/userSettings/constants/user-settings-endpoints';

const MobileFileAccessCard: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
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
          onClick={() => navigate(USER_SETTINGS_MOBILE_ACCESS_PATH)}
        >
          <img
            src={AppleLogo}
            alt="AppleLogo"
            width="20px"
          />
          <p>{t('dashboard.mobileAccess.manual')}</p>
        </Button>
      </CardContent>
    </Card>
  );
};

export default MobileFileAccessCard;
