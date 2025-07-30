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

import React, { FC, useMemo } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Sizes } from '@libs/ui/types/sizes';
import cn from '@libs/common/utils/className';
import CircleLoader from './Loading/CircleLoader';

type QRSizeKey = Sizes | 'default';

const SIZE_CONFIG = {
  sm: { px: 64, cls: 'w-[64px]  h-[64px]' },
  md: { px: 128, cls: 'w-[128px] h-[128px]' },
  lg: { px: 200, cls: 'w-[200px] h-[200px]' },
  xl: { px: 256, cls: 'w-[256px] h-[256px]' },
  default: { px: 256, cls: 'w-[256px] h-[256px]' },
} as const satisfies Record<QRSizeKey, { px: number; cls: string }>;

interface QRCodeDisplayProps {
  value: string;
  size?: QRSizeKey;
  className?: string;
  isLoading?: boolean;
}

const QRCodeDisplay: FC<QRCodeDisplayProps> = ({ value, size = 'default', className = '', isLoading = false }) => {
  const { px: pixelSize, cls: sizeClass } = useMemo<{
    px: number;
    cls: string;
  }>(() => SIZE_CONFIG[size], [size]);

  return (
    <div className={cn('flex flex-col items-center justify-center rounded-xl bg-background p-2', sizeClass, className)}>
      {isLoading ? (
        <CircleLoader className={sizeClass} />
      ) : (
        <QRCodeSVG
          value={value}
          size={pixelSize}
        />
      )}
    </div>
  );
};

export default QRCodeDisplay;
