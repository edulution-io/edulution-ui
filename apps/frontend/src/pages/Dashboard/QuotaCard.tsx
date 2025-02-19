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
import Quota from '@/pages/Dashboard/Quota';
import { CardContent, Card } from '@/components/shared/Card';

const QuotaCard = () => {
  const { t } = useTranslation();

  return (
    <Card variant="security">
      <CardContent>
        <h4 className="text-md mb-6 font-bold">{t('dashboard.quota.title')}</h4>
        <div className="flex flex-col gap-2">
          <Quota />
        </div>
      </CardContent>
    </Card>
  );
};

export default QuotaCard;
