import React from 'react';
import ProgressSH from '@/components/ui/ProgessSH';

const QuotaBar = () => (
  <div className="text-sm text-gray-700">
    <p className="pb-2 text-xs text-gray-500">Speicherplatz: </p>
    <p className="pb-2 text-xs text-gray-500">Agy: 20 / 1500 MiB</p>
    <div className="mb-2 h-2 w-full rounded-full bg-gray-200">
      {' '}
      <ProgressSH value={26} />
    </div>
    <p className="pb-2 text-xs text-gray-500">global: 20 / 1500 MiB</p>
    <div className=" h-2 w-full rounded-full bg-gray-200">
      {' '}
      <ProgressSH value={33} />
    </div>
  </div>
);

export default QuotaBar;
