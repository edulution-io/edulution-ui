import React, { FC } from 'react';
import ProgressSH from '@/components/ui/ProgessSH';

interface QuotaBarProps {
  username?: string;
}

const QuotaBar: FC<QuotaBarProps> = ({ username = 'username' }) => {
  const totalQuota = 2500; // Total allowed quota in MiB

  const userQuota =
    Math.round(
      username
        .split('')
        .map((char) => char.charCodeAt(0))
        .reduce((current, previous) => previous + current) * 12,
    ) / 10;

  const userQuotaPercentage = (userQuota / totalQuota) * 100;
  const schoolQuotaPercentage = ((userQuota * 3) / (totalQuota * 4)) * 100;

  return (
    <div className="text-sm text-gray-300">
      <p className="pb-2 text-xs">Speicherplatz:</p>
      <p className="pb-2 text-xs">
        {userQuota} / {totalQuota} MiB
      </p>
      <div className="mb-2 h-0.5 w-full rounded-full bg-gray-200">
        <ProgressSH
          value={userQuotaPercentage}
          className="h-0.5"
        />
      </div>
      <p className="pb-2 text-xs">Global:</p>
      <p className="pb-2 text-xs">
        {Math.round(userQuota * 3)} / {totalQuota * 4} MiB
      </p>
      <div className="h-0.5 w-full rounded-full bg-gray-200">
        <ProgressSH
          value={schoolQuotaPercentage}
          className="h-0.5"
        />
      </div>
    </div>
  );
};

export default QuotaBar;
