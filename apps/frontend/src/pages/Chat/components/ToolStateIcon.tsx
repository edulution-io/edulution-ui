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
