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
import { AlertTriangle } from 'lucide-react';
import cn from '@libs/common/utils/className';
import QuotaThresholdPercent from '@libs/filesharing/constants/quotaThresholdPercent';
import { useTranslation } from 'react-i18next';

interface QuotaLimitBadgeProps {
  percentageUsed: number;
}

const QuotaLimitInfo: React.FC<QuotaLimitBadgeProps> = ({ percentageUsed }) => {
  const isWarn = percentageUsed >= QuotaThresholdPercent.WARNING && percentageUsed < QuotaThresholdPercent.CRITICAL;
  const isError = percentageUsed >= QuotaThresholdPercent.CRITICAL;

  const { t } = useTranslation();

  if (!isWarn && !isError) return null;

  const iconColor = isError ? 'text-red-700' : 'text-yellow-600';
  const wrapperClasses = isError ? 'animate-pulse' : 'animate-none';

  const free = 100 - Math.round(percentageUsed);
  const quotaLabel = t(isError ? 'dashboard.quota.remainingVeryLow' : 'dashboard.quota.remainingLow', { free });

  return (
    <div className={cn('flex items-center gap-2', wrapperClasses)}>
      <AlertTriangle
        className={cn('h-4 w-4', iconColor)}
        aria-hidden
      />

      <span className="text-xs">{quotaLabel}</span>
    </div>
  );
};

export default QuotaLimitInfo;
