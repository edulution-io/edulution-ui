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

import React, { useEffect } from 'react';
import { MdExpandMore } from 'react-icons/md';
import { TbLayoutSidebarRightCollapse } from 'react-icons/tb';
import { RiRobot2Fill } from 'react-icons/ri';
import useAIChatStore from '@/pages/Chat/hooks/useAIChatStore';
import useChatStore from '@/pages/Chat/hooks/useChatStore';
import DropdownMenu from '@/components/shared/DropdownMenu';
import DropdownMenuItemType from '@libs/ui/types/dropdownMenuItemType';
import cn from '@libs/common/utils/className';
import { Tooltip } from '@/components/ui/Tooltip';
import AiConfigPurposes from '@libs/ai/constants/aiConfigPurposes';
import ToolSelector from './ToolSelector';

interface ChatHeaderAIProps {
  isPopout?: boolean;
}

const ChatHeaderAI: React.FC<ChatHeaderAIProps> = ({ isPopout = false }) => {
  const { aiConfig, availableModels, currentChatId, isConfigLoading, fetchAIConfig, setActiveModel } = useAIChatStore();
  const { setCurrentlyOpenChat, setIsChatPopoutVisible, setIsChatDocked, isChatDocked } = useChatStore();
  useEffect(() => {
    void fetchAIConfig(AiConfigPurposes.CHAT);
  }, [fetchAIConfig]);

  const modelLabel = aiConfig?.name || aiConfig?.aiModel;

  const hasMultipleModels = (availableModels?.length ?? 0) > 1;

  const dropdownItems: DropdownMenuItemType[] = hasMultipleModels
    ? availableModels.map((model) => ({
        label: model.name,
        icon: RiRobot2Fill,
        onClick: () => setActiveModel(model),
        checked: aiConfig?.configId === model.configId,
        isCheckbox: true,
        onCheckedChange: () => setActiveModel(model),
      }))
    : [];

  const handleUndock = () => {
    const chatIdToOpen = currentChatId || 'new';

    setCurrentlyOpenChat({
      chatId: chatIdToOpen,
      type: 'ai',
    });
    setIsChatPopoutVisible(true);
    setIsChatDocked(false);
  };

  const trigger = (
    <div
      className={cn('flex cursor-pointer items-center gap-1 text-background', hasMultipleModels && 'hover:opacity-80')}
    >
      <span className="text-lg font-semibold">{modelLabel}</span>
      {!isConfigLoading && hasMultipleModels && <MdExpandMore className="h-5 w-5 text-muted-foreground" />}
    </div>
  );
  return (
    <div className="flex items-center justify-between border-b border-muted p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full">
          <RiRobot2Fill className="h-6 w-6 text-primary" />
        </div>

        {hasMultipleModels ? (
          <DropdownMenu
            trigger={trigger}
            items={dropdownItems}
            disabled={isConfigLoading}
          />
        ) : (
          <span className="text-lg font-semibold text-background">{modelLabel}</span>
        )}

        {isConfigLoading && (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
        )}

        <ToolSelector />
      </div>

      {!isPopout && isChatDocked && (
        <Tooltip>
          <button
            type="button"
            onClick={handleUndock}
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-background"
          >
            <TbLayoutSidebarRightCollapse className="h-5 w-5" />
          </button>
        </Tooltip>
      )}
    </div>
  );
};

export default ChatHeaderAI;
