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

import { SizeProp } from '@fortawesome/fontawesome-svg-core';
import { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { HTMLAttributes } from 'react';
import React, { FC } from 'react';

interface IconWithCountProps extends HTMLAttributes<HTMLSpanElement> {
  icon: IconDefinition;
  count?: number;
  size?: SizeProp;
  badgeSize?: number;
  className?: string;
}

const IconWithCount: FC<IconWithCountProps> = ({
  icon,
  count = 0,
  size = 'lg',
  badgeSize = 16,
  className = '',
  ...rest
}) => {
  const badgePx = `${badgeSize}px`;
  const fontPx = `${Math.round(badgeSize * 0.6)}px`;

  return (
    <span
      className={`relative inline-block ${className}`}
      style={{ cursor: rest.onClick ? 'pointer' : undefined }}
      {...rest}
    >
      <FontAwesomeIcon
        icon={icon}
        size={size}
      />

      {count > 0 && (
        <span
          className="
            absolute -right-1 -top-1
            flex items-center justify-center
            rounded-full bg-primary font-semibold leading-none text-white
          "
          style={{
            height: badgePx,
            minWidth: badgePx,
            fontSize: fontPx,
            padding: '0 2px',
          }}
        >
          {count > 99 ? '99+' : count}
        </span>
      )}
    </span>
  );
};

export default IconWithCount;
