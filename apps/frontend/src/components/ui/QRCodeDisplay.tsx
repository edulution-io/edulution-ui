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

import React, { FC } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Sizes } from '@libs/ui/types/sizes';
import cn from '@libs/common/utils/className';
import CircleLoader from './Loading/CircleLoader';

interface QRCodeDisplayProps {
  value: string;
  size?: Sizes;
  className?: string;
  isLoading?: boolean;
}

const sizeClassMap = {
  sm: 'w-[64px] h-[64px]',
  md: 'w-[128px] h-[128px]',
  lg: 'w-[200px] h-[200px]',
  default: 'w-[256px] h-[256px]',
};

const QRCodeDisplay: FC<QRCodeDisplayProps> = ({ value, size, className, isLoading = false }) => {
  const getPixelSize = () => {
    switch (size) {
      case 'sm':
        return 64;
      case 'md':
        return 128;
      case 'lg':
        return 200;
      default:
        return 256;
    }
  };

  const getSizeClass = () => {
    switch (size) {
      case 'sm':
        return sizeClassMap.sm;
      case 'md':
        return sizeClassMap.md;
      case 'lg':
        return sizeClassMap.lg;
      default:
        return sizeClassMap.default;
    }
  };

  return (
    <div className={cn(className, 'flex flex-col items-center justify-center rounded-xl bg-background p-2')}>
      {isLoading ? (
        <CircleLoader className={getSizeClass()} />
      ) : (
        <QRCodeSVG
          value={value}
          size={getPixelSize()}
        />
      )}
    </div>
  );
};

export default QRCodeDisplay;
