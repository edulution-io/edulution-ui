import React, { FC } from 'react';
import CircleLoader from '@/components/ui/CircleLoader';

interface StateLoaderProps {
  isLoading: boolean;
}

const StateLoader: FC<StateLoaderProps> = ({ isLoading }) => (
  <div className="flex items-center justify-end pr-12">
    {isLoading ? <CircleLoader className="h-1 w-1" /> : <div className="h-1 w-1" />}
  </div>
);

export default StateLoader;
