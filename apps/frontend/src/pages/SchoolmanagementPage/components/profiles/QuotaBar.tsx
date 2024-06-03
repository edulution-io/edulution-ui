import React, { FC } from 'react';
import ProgressSH from '@/components/ui/ProgessSH';

interface QuotaBarProps {
  schoolQuota: number;
  userQuota: number;
}

const QuotaBar: FC<QuotaBarProps> = ({ schoolQuota, userQuota }) => {
  const totalQuota = 1500; // Total allowed quota in MiB

  const userQuotaPercentage = (userQuota / totalQuota) * 100;
  const schoolQuotaPercentage = (schoolQuota / totalQuota) * 100;

  return (
    <div className="text-sm text-gray-300">
      <p className="pb-2 text-xs">Speicherplatz:</p>
      <p className="pb-2 text-xs">
        Agy: {userQuota} / {totalQuota} MiB
      </p>
      <div className="mb-2 h-0.5 w-full rounded-full bg-gray-200">
        <ProgressSH
          value={userQuotaPercentage}
          className="h-0.5"
        />
      </div>
      <p className="pb-2 text-xs">
        global: {schoolQuota} / {totalQuota} MiB
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
