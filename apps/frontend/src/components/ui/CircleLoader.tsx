import React from 'react';
import { motion } from 'framer-motion';
import cn from '@libs/common/utils/className';

interface CircleLoaderProps {
  className?: string;
  transitionDurationMS?: number;
}

const CircleLoader = ({ className, transitionDurationMS = 1000 }: CircleLoaderProps) => (
  <div className={cn('relative box-border h-12 w-12', className)}>
    <motion.span
      className="absolute left-0 top-0 z-30 box-border block h-12 w-12 rounded-full border-4 border-t-4 border-gray-300 border-t-blue-500"
      animate={{ rotate: 360 }}
      transition={{
        loop: Infinity,
        ease: 'linear',
        duration: transitionDurationMS,
      }}
      style={{
        animation: `spin ${transitionDurationMS / 1000}s linear infinite`,
      }}
    />
  </div>
);

export default CircleLoader;
