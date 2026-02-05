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

import React, { CSSProperties, useMemo } from 'react';
import { cn } from '@edulution-io/ui-kit';
import getAppIconClassName from '@/utils/getAppIconClassName';
import {
  CUSTOM_UPLOAD_IDENTIFIER,
  FONT_AWESOME_IDENTIFIER,
  DEFAULT_ICON_MASK_SIZE,
  DEFAULT_ICON_WEBP_SIZE,
} from '@libs/ui/constants/icon';
import { resolveFontAwesomeIconUrl } from '@/utils/fontAwesomeIcons';

interface IconWrapperProps {
  iconSrc: string;
  alt: string;
  className?: string;
  width?: number | string;
  height?: number | string;
  style?: CSSProperties;
  applyLegacyFilter?: boolean;
  fontAwesomeMaskSize?: string;
}

const IconWrapper: React.FC<IconWrapperProps> = ({
  iconSrc,
  alt,
  className = '',
  width,
  height,
  style = {},
  applyLegacyFilter = true,
  fontAwesomeMaskSize = DEFAULT_ICON_MASK_SIZE,
}) => {
  const isFontAwesomeIcon = iconSrc.includes(FONT_AWESOME_IDENTIFIER);
  const isWebp = iconSrc.endsWith('.webp') || iconSrc.includes('data:image/webp');
  const isUploadedSvg = iconSrc.includes(CUSTOM_UPLOAD_IDENTIFIER);
  const useMaskTechnique = isFontAwesomeIcon || isUploadedSvg;

  const resolvedIconSrc = useMemo(() => {
    if (isFontAwesomeIcon) {
      return resolveFontAwesomeIconUrl(iconSrc);
    }
    return iconSrc;
  }, [iconSrc, isFontAwesomeIcon]);

  if (useMaskTechnique) {
    return (
      <div
        className={cn(applyLegacyFilter ? 'text-background dark:text-white' : 'text-white', className)}
        style={{
          width,
          height,
          WebkitMaskImage: `url(${resolvedIconSrc})`,
          maskImage: `url(${resolvedIconSrc})`,
          WebkitMaskRepeat: 'no-repeat',
          maskRepeat: 'no-repeat',
          WebkitMaskSize: fontAwesomeMaskSize,
          maskSize: fontAwesomeMaskSize,
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
      <div
        className={className}
        style={{
          width,
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          ...style,
        }}
      >
        <img
          src={iconSrc}
          alt={alt}
          style={{
            width: DEFAULT_ICON_WEBP_SIZE,
            height: DEFAULT_ICON_WEBP_SIZE,
            objectFit: 'contain',
          }}
        />
      </div>
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
