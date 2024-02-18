import {TooltipContent, TooltipTrigger} from "@radix-ui/react-tooltip";
import {Tooltip} from "@/components/ui/tooltip.tsx";
import React from 'react';

interface ActionTooltipProps {
    trigger: React.ReactNode;
    onAction: () => void;
    tooltipText: string;
}

export const ActionTooltip: React.FC<ActionTooltipProps> = ({trigger, onAction, tooltipText}) => {
    return (
            <Tooltip>
                <TooltipTrigger asChild>
                    <button onClick={onAction}>
                        {trigger}
                    </button>
                </TooltipTrigger>
                <TooltipContent side="top" align="center">
                    {tooltipText}
                </TooltipContent>
            </Tooltip>
    );
};

