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
import { MdClose } from 'react-icons/md';
import CircleLoader from '@/components/ui/Loading/CircleLoader';
import cn from '@libs/common/utils/className';
import useChatGroups from '@/pages/Chat/hooks/useChatGroups';
import useChatMembers from '@/pages/Chat/hooks/useChatMembers';
import MemberList from '@/pages/Chat/components/MemberList';
import { Button } from '@/components/shared/Button';
import Input from '@/components/shared/Input';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import useMedia from '@/hooks/useMedia';

interface ChatMembersPanelProps {
  isOpen: boolean;
  onClose: () => void;
  groupCn?: string;
  groupType?: 'class' | 'project';
}

const ChatMembersPanel: React.FC<ChatMembersPanelProps> = ({ isOpen, onClose, groupCn, groupType }) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const { isMobileView } = useMedia();

  const { schoolClasses, projects, groupsKey } = useChatGroups();

  const { members, isLoading } =
    groupCn && groupType
      ? useChatMembers({ groupCn, groupType })
      : useChatMembers({ schoolClasses, projects, groupsKey });

  const renderContent = () => (
    <div className="flex flex-col gap-4">
      <Input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder={t('common.search')}
        className="!w-full !min-w-0"
      />

      <div className="overflow-y-auto scrollbar-thin md:h-[calc(100vh-180px)]">
        {isLoading ? (
          <div className="flex h-32 items-center justify-center">
            <CircleLoader />
          </div>
        ) : (
          <MemberList
            members={members}
            searchQuery={searchQuery}
            groupByRole
            showClass
          />
        )}
      </div>
    </div>
  );

  if (isMobileView) {
    return (
      <AdaptiveDialog
        isOpen={isOpen}
        handleOpenChange={onClose}
        title={`${t('chat.members')} (${members.length})`}
        body={renderContent()}
      />
    );
  }

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-overlay-transparent"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className={cn(
          'fixed right-[var(--sidebar-width)] top-0 z-50 flex h-full w-80 flex-col',
          'bg-accent shadow-xl transition-transform duration-300',
          isOpen ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <div className="flex items-center justify-between border-b border-muted p-4">
          <h2 className="text-lg font-semibold text-background">
            {t('chat.members')} ({members.length})
          </h2>
          <Button
            type="button"
            onClick={onClose}
            className="hover:bg-muted-transparent text-background"
          >
            <MdClose className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-hidden p-4">{renderContent()}</div>
      </div>
    </>
  );
};

export default ChatMembersPanel;
