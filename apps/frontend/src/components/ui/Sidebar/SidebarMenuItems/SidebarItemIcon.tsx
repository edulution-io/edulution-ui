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
import { SIDEBAR_ICON_HEIGHT, SIDEBAR_ICON_WIDTH } from '@libs/ui/constants/sidebar';

const SidebarItemIcon = ({ isHovered, iconSrc, title }: { isHovered: boolean; iconSrc: string; title: string }) => (
  <div
    style={{ height: SIDEBAR_ICON_HEIGHT, width: SIDEBAR_ICON_WIDTH }}
    className="relative z-0 -mt-2 ml-[0.8rem] flex items-center justify-center"
  >
    <img
      src={iconSrc}
      height={SIDEBAR_ICON_HEIGHT}
      width={SIDEBAR_ICON_WIDTH}
      className={`max-h-full max-w-full origin-top transform transition-transform duration-200 ${
        isHovered ? 'scale-[1.17]' : 'scale-100'
      }`}
      alt={`${title}-icon`}
    />
  </div>
);

export default SidebarItemIcon;
