/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
 *
 * This software is dual-licensed under the terms of:
 *
 * 1. The GNU Affero General Public License (AGPL-3.0-or-later), as published by the Free Software Foundation.
 *    You may use, modify and distribute this software under the terms of the AGPL, provided that you comply with its conditions.
 *
 *    A copy of the license can be found at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * OR
 *
 * 2. A commercial license agreement with Netzint GmbH. Licensees holding a valid commercial license from Netzint GmbH
 *    may use this software in accordance with the terms contained in such written agreement, without the obligations imposed by the AGPL.
 *
 * If you are uncertain which license applies to your use case, please contact us at info@netzint.de for clarification.
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
