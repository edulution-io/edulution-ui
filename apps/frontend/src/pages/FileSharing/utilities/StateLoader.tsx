import React, { FC } from 'react';
import CircleLoader from '@/components/ui/CircleLoader';

interface StateLoaderProps {
  isLoading: boolean;
}

const StateLoader: FC<StateLoaderProps> = ({ isLoading }) =>
  isLoading ? (
    <div className="flex items-center justify-end pr-12">
      <CircleLoader className="h-1 w-1" />
    </div>
  ) : null;

export default StateLoader;
