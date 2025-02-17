/*
 * LICENSE
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

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
