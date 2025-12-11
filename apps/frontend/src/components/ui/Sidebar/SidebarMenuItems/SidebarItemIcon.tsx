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

import React from 'react';
import { SIDEBAR_ICON_HEIGHT, SIDEBAR_ICON_WIDTH } from '@libs/ui/constants/sidebar';
import getAppIconClassName from '@libs/ui/utils/getAppIconClassName';
import cn from '@libs/common/utils/className';

const SidebarItemIcon = ({
  isHovered,
  isSelected,
  iconSrc,
  title,
}: {
  isHovered: boolean;
  isSelected: boolean;
  iconSrc: string;
  title: string;
}) => (
  <div
    style={{ height: SIDEBAR_ICON_HEIGHT, width: SIDEBAR_ICON_WIDTH }}
    className="relative z-0 -mt-2 ml-[0.8rem] flex items-center justify-center"
  >
    <img
      src={iconSrc}
      height={SIDEBAR_ICON_HEIGHT}
      width={SIDEBAR_ICON_WIDTH}
      className={cn(
        'max-h-full max-w-full origin-top transform transition-transform duration-200',
        isHovered ? 'scale-[1.17]' : 'scale-100',
        !isHovered && !isSelected && getAppIconClassName(iconSrc),
      )}
      alt={`${title}-icon`}
    />
  </div>
);

export default SidebarItemIcon;
