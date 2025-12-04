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
import { MdArrowDropDown, MdArrowDropUp } from 'react-icons/md';
import { SidebarArrowButtonProps } from '@libs/ui/types/sidebar/sidebarArrowButtonProps';
import { SIDEBAR_ARROW_BUTTON_HEIGHT } from '@libs/ui/constants/sidebar';

export interface ArrowButtonProps extends SidebarArrowButtonProps {
  direction: 'up' | 'down';
}

const SidebarArrowButton: React.FC<ArrowButtonProps> = ({ direction, onClick }) => {
  const ArrowIcon = direction === 'up' ? MdArrowDropUp : MdArrowDropDown;

  const borderClass = direction === 'up' ? 'border-b-2' : 'border-t-2';

  return (
    <button
      type="button"
      style={{ height: SIDEBAR_ARROW_BUTTON_HEIGHT }}
      className={`relative z-50 w-full cursor-pointer ${borderClass} border-muted bg-secondary-foreground px-4 py-2 hover:bg-accent dark:bg-foreground dark:hover:bg-stone-900 md:block md:px-2`}
      onClick={onClick}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <ArrowIcon className="h-8 w-8" />
      </div>
    </button>
  );
};

export default SidebarArrowButton;
