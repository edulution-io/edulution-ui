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

interface HorizontalLoaderProps {
  className?: string;
  transitionDurationMS?: number;
  height?: string;
  width?: string;
  barWidth?: string;
  barColor?: string;
  backgroundColor?: string;
}

const HorizontalLoader = ({
  className,
  transitionDurationMS = 4000,
  height = 'h-1',
  width = 'w-full',
  barWidth = 'w-1/2',
  barColor = 'bg-primary',
  backgroundColor = 'bg-muted-foreground',
}: HorizontalLoaderProps) => (
  <div className={cn('relative overflow-hidden rounded-xl', height, width, backgroundColor, className)}>
    <motion.span
      className={cn('absolute bottom-0 left-0 top-0', barWidth, barColor)}
      animate={{ x: ['0%', '100%', '0%'] }}
      transition={{
        duration: transitionDurationMS / 1000,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  </div>
);

export default HorizontalLoader;
