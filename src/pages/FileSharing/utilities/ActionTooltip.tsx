import { TooltipContent, TooltipTrigger } from '@radix-ui/react-tooltip';
import { Tooltip } from '@/components/ui/tooltip';
import React from 'react';

interface ActionTooltipProps {
  trigger: React.ReactNode;
  onAction: () => void;
  tooltipText: string;
}

const ActionTooltip: React.FC<ActionTooltipProps> = ({ trigger, onAction, tooltipText }) => {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
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
        side="top"
        align="center"
      >
        {tooltipText}
      </TooltipContent>
    </Tooltip>
  );
};

export default ActionTooltip;
