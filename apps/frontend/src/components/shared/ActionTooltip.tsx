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

import { TooltipContent, TooltipTrigger } from '@radix-ui/react-tooltip';
import { Tooltip } from '@/components/ui/Tooltip';
import React from 'react';
import cn from '@libs/common/utils/className';

interface ActionTooltipProps {
  trigger: React.ReactNode;
  onAction?: () => void;
  tooltipText: string;
  className?: string;
  openOnSide?: 'top' | 'left' | 'bottom' | 'right';
}

const ActionTooltip: React.FC<ActionTooltipProps> = ({
  trigger,
  onAction,
  tooltipText,
  className,
  openOnSide = 'top',
}) => {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if ((event.key === 'Enter' || event.key === ' ') && onAction) {
      onAction();
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          role="button"
          tabIndex={0}
          onClick={onAction}
          onKeyDown={handleKeyDown}
        >
          {trigger}
        </div>
      </TooltipTrigger>
      <TooltipContent
        className={cn('rounded-lg bg-accent p-2 shadow-xl', className)}
        side={openOnSide}
        align="center"
      >
        {tooltipText}
      </TooltipContent>
    </Tooltip>
  );
};

export default ActionTooltip;
