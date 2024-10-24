import React from 'react';
import { motion } from 'framer-motion';
import cn from '@libs/common/utils/className';

interface CircleLoaderProps {
  className?: string;
}

const CircleLoader = ({ className }: CircleLoaderProps) => (
  <div className={cn('relative box-border h-12 w-12', className)}>
    <motion.span
      className="absolute left-0 top-0 box-border block h-12 w-12 rounded-full border-4 border-t-4 border-gray-300 border-t-blue-500"
      animate={{ rotate: 360 }}
      transition={{
        loop: Infinity,
        ease: 'linear',
        duration: 1000,
      }}
      style={{
        animation: 'spin 1s linear infinite',
      }}
    />
  </div>
);

export default CircleLoader;
