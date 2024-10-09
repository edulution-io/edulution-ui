import { TooltipContent, TooltipTrigger } from '@radix-ui/react-tooltip';
import { Tooltip } from '@/components/ui/Tooltip';
import React from 'react';
import cn from '@/lib/utils';

interface ActionTooltipProps {
  trigger: React.ReactNode;
  onAction?: () => void;
  tooltipText: string;
  className?: string;
}

const ActionTooltip: React.FC<ActionTooltipProps> = ({ trigger, onAction, tooltipText, className }) => {
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
        className={cn('rounded-lg bg-accent-foreground p-2', className)}
        side="top"
        align="center"
      >
        {tooltipText}
      </TooltipContent>
    </Tooltip>
  );
};

export default ActionTooltip;
