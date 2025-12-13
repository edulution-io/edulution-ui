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

import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import useChatMembers from '@/pages/Chat/hooks/useChatMembers';
import Avatar from '@/components/shared/Avatar';
import { ChatGroupType } from '@libs/chat/types/chatGroupType';

interface ChatHeaderGroupProps {
  groupCn: string;
  groupType: ChatGroupType;
  groupName?: string;
  maxMembers?: number;
}

const ChatHeaderGroup: React.FC<ChatHeaderGroupProps> = ({ groupCn, groupType, groupName, maxMembers = 3 }) => {
  const { t } = useTranslation();
  const { members, isLoading } = useChatMembers({ groupCn, groupType });

  const displayedMembers = useMemo(() => members.slice(0, maxMembers), [members, maxMembers]);

  const remainingCount = members.length - maxMembers;

  const memberNames = useMemo(() => {
    const names = displayedMembers.map((m) => m.givenName || m.displayName || m.cn);
    return names.join(', ');
  }, [displayedMembers]);

  return (
    <div className="flex flex-col gap-2 p-4">
      {groupName && <h2 className="text-lg font-semibold text-background">{groupName}</h2>}

      <div className="flex items-center gap-2">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
        ) : (
          <>
            <div className="flex -space-x-1">
              {displayedMembers.map((member) => (
                <Avatar
                  key={member.cn}
                  user={{
                    username: member.cn || '',
                    firstName: member.givenName,
                    lastName: member.sn,
                  }}
                  className="h-6 w-6 border border-accent"
                />
              ))}
            </div>

            <span className="text-sm text-muted-foreground">
              {memberNames}
              {remainingCount > 0 && ` +${remainingCount}`}
            </span>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatHeaderGroup;
