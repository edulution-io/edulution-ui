import { TooltipContent, TooltipTrigger } from '@radix-ui/react-tooltip';
import { Tooltip } from '@/components/ui/tooltip';
import React from 'react';

interface ActionTooltipProps {
  trigger: React.ReactNode;
  onAction: () => void;
  tooltipText: string;
}

const ActionTooltip: React.FC<ActionTooltipProps> = ({ trigger, onAction, tooltipText }) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <button
        type="button"
        onClick={onAction}
      >
        {trigger}
      </button>
    </TooltipTrigger>
    <TooltipContent
      side="top"
      align="center"
    >
      {tooltipText}
    </TooltipContent>
  </Tooltip>
);

export default ActionTooltip;
