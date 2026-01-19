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

import React, { CSSProperties } from 'react';
import cn from '@libs/common/utils/className';
import getAppIconClassName from '@/utils/getAppIconClassName';

interface IconWrapperProps {
  iconSrc: string;
  alt: string;
  className?: string;
  width?: number | string;
  height?: number | string;
  style?: CSSProperties;
  applyLegacyFilter?: boolean;
}

const IconWrapper: React.FC<IconWrapperProps> = ({
  iconSrc,
  alt,
  className = '',
  width,
  height,
  style = {},
  applyLegacyFilter = true,
}) => {
  const isFontAwesomeIcon = iconSrc.includes('fontawsome-');
  const isWebp = iconSrc.endsWith('.webp') || iconSrc.includes('data:image/webp');

  if (isFontAwesomeIcon) {
    return (
      <div
        className={cn(applyLegacyFilter ? 'text-background dark:text-white' : 'text-white', className)}
        style={{
          width,
          height,
          WebkitMaskImage: `url(${iconSrc})`,
          maskImage: `url(${iconSrc})`,
          WebkitMaskRepeat: 'no-repeat',
          maskRepeat: 'no-repeat',
          WebkitMaskSize: 'contain',
          maskSize: 'contain',
          WebkitMaskPosition: 'center',
          maskPosition: 'center',
          backgroundColor: 'currentColor',
          ...style,
        }}
      />
    );
  }

  if (isWebp) {
    return (
      <img
        src={iconSrc}
        alt={alt}
        width={width}
        height={height}
        className={className}
        style={style}
      />
    );
  }

  return (
    <img
      src={iconSrc}
      alt={alt}
      width={width}
      height={height}
      className={cn(className, applyLegacyFilter && getAppIconClassName(iconSrc))}
      style={style}
    />
  );
};

export default IconWrapper;
