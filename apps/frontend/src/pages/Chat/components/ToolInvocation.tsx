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

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdBuildCircle, MdExpandLess, MdExpandMore } from 'react-icons/md';
import cn from '@libs/common/utils/className';
import ToolInvocationData from '@libs/ai/types/toolInvocationData';
import formatToolResult from '@libs/mcp/utils/formatToolResult';
import ToolStateIcon from '@/pages/Chat/components/ToolStateIcon';
import { Button } from '@/components/shared/Button';
import toolInvocationStates from '@libs/mcp/constants/toolInvocationStates';

interface ToolInvocationProps {
  invocation: ToolInvocationData;
}

const ToolInvocation: React.FC<ToolInvocationProps> = ({ invocation }) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

  const { toolInvocation } = invocation;
  const { state, toolName, result } = toolInvocation;

  const isComplete = state === toolInvocationStates.OUTPUT_AVAILABLE || state === toolInvocationStates.OUTPUT_ERROR;
  const hasResult = result !== undefined && result !== null;
  const formattedResult = formatToolResult(result);
  const isLongResult = formattedResult.length > 200;

  const toggleExpanded = () => {
    if (hasResult) {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div className="bg-muted/30 my-2 rounded-lg border border-muted">
      <Button
        type="button"
        variant="btn-ghost"
        onClick={toggleExpanded}
        disabled={!hasResult}
        className={cn(
          'flex w-full items-center justify-between gap-2 px-3 py-2',
          hasResult && 'hover:bg-muted/50 cursor-pointer',
        )}
      >
        <div className="flex items-center gap-2">
          <MdBuildCircle className="h-4 w-4 text-accent" />
          <span className="text-sm font-medium text-background">{toolName}</span>
        </div>

        <div className="flex items-center gap-2">
          <ToolStateIcon state={state} />
          <span className="text-xs text-muted-foreground">
            {isComplete ? t('chat.toolComplete') : t('chat.toolRunning')}
          </span>
          {hasResult && (isExpanded ? <MdExpandLess className="h-4 w-4" /> : <MdExpandMore className="h-4 w-4" />)}
        </div>
      </Button>

      {hasResult && (isExpanded || !isLongResult) && (
        <div className="border-t border-muted px-3 py-2">
          <pre
            className={cn(
              'overflow-x-auto whitespace-pre-wrap break-words text-xs text-muted-foreground',
              !isExpanded && isLongResult && 'line-clamp-3',
            )}
          >
            {formattedResult}
          </pre>
        </div>
      )}

      {hasResult && !isExpanded && isLongResult && (
        <div className="border-t border-muted px-3 py-1">
          <Button
            type="button"
            onClick={toggleExpanded}
            variant="btn-ghost"
            className="text-xs text-accent hover:underline"
          >
            {t('common.showMore')}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ToolInvocation;
