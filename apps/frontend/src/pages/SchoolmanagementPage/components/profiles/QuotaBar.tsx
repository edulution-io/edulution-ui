import React from 'react';
import ProgressSH from '@/components/ui/ProgessSH';

const QuotaBar = () => (
  <div className="text-sm text-gray-300">
    <p className="pb-2 text-xs ">Speicherplatz: </p>
    <p className="pb-2 text-xs">Agy: 20 / 1500 MiB</p>
    <div className="mb-2 h-0.5 w-full rounded-full bg-gray-200">
      <ProgressSH
        value={26}
        className="h-0.5"
      />
    </div>
    <p className="pb-2 text-xs">global: 20 / 1500 MiB</p>
    <div className="h-0.5 w-full rounded-full bg-gray-200">
      <ProgressSH
        value={33}
        className="h-0.5"
      />
    </div>
  </div>
);

export default QuotaBar;
