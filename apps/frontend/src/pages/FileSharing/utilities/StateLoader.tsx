import React, { FC } from 'react';
import CircleLoader from '@/components/ui/CircleLoader';

interface StateLoaderProps {
  isFileProcessing: boolean;
}

const StateLoader: FC<StateLoaderProps> = ({ isFileProcessing }) =>
  isFileProcessing ? <CircleLoader className="h-2 w-2" /> : null;

export default StateLoader;
