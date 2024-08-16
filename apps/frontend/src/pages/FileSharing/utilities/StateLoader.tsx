import React, { FC } from 'react';
import CircleLoader from '@/components/ui/CircleLoader';

interface StateLoaderProps {
  isLoading: boolean;
}

const StateLoader: FC<StateLoaderProps> = ({ isLoading }) => (
  <div className="flex items-center justify-end pr-10">{isLoading ? <CircleLoader className="h-2 w-2" /> : <p />}</div>
);

export default StateLoader;
