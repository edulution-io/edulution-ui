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

import type { HTMLAttributes } from 'react';
import React, { FC } from 'react';
import type { IconType } from 'react-icons';

interface IconWithCountProps extends HTMLAttributes<HTMLSpanElement> {
  Icon: IconType;
  count?: number;
  size?: string;
  badgeSize?: number;
  className?: string;
}

const IconWithCount: FC<IconWithCountProps> = ({
  Icon,
  count = 0,
  size = 24,
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
      <Icon size={size} />

      {count > 0 && (
        <span
          className="
            absolute -right-1 -top-1
            flex items-center justify-center
            rounded-full bg-ciLightBlue font-semibold leading-none text-background
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
