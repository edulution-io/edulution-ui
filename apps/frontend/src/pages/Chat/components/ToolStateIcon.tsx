import React from 'react';
import { MdCheck, MdError, MdSync } from 'react-icons/md';
import toolInvocationStates from '@libs/mcp/constants/toolInvocationStates';
import { ToolInvocationStatesType } from '@libs/mcp/types/toolInvocationStatesType';

interface ToolStateIconProps {
  state: ToolInvocationStatesType;
}

const ToolStateIcon: React.FC<ToolStateIconProps> = ({ state }) => {
  switch (state) {
    case toolInvocationStates.OUTPUT_AVAILABLE:
      return <MdCheck className="h-4 w-4 text-green-500" />;
    case toolInvocationStates.OUTPUT_ERROR:
      return <MdError className="h-4 w-4 text-red-500" />;
    case toolInvocationStates.INPUT_STREAMING:
    case toolInvocationStates.INPUT_AVAILABLE:
    default:
      return <MdSync className="h-4 w-4 animate-spin text-accent" />;
  }
};

export default ToolStateIcon;
