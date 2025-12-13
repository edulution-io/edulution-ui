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
import cn from '@libs/common/utils/className';
import Avatar from '@/components/shared/Avatar';

interface AvatarUser {
  username: string;
  firstName?: string;
  lastName?: string;
}

interface AvatarStackProps {
  users: AvatarUser[];
  max?: number;
  className?: string;
  avatarClassName?: string;
}

const AvatarStack: React.FC<AvatarStackProps> = ({ users, max = 3, className, avatarClassName = 'h-6 w-6' }) => {
  const displayedUsers = users.slice(0, max);
  const remainingCount = users.length - max;

  return (
    <div className={cn('flex items-center', className)}>
      <div className="flex -space-x-1">
        {displayedUsers.map((user) => (
          <Avatar
            key={user.username}
            user={user}
            className={cn(avatarClassName, 'border border-accent')}
          />
        ))}
      </div>

      {remainingCount > 0 && <span className="ml-1 text-xs text-muted-foreground">+{remainingCount}</span>}
    </div>
  );
};

export default AvatarStack;
