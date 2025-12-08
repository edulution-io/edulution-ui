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
