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
