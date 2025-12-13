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
import { Button } from '@/components/shared/Button';
import MemberInfo from '@libs/chat/types/memberInfo';
import MemberAvatar from './MemberAvatar';

interface MemberListItemProps {
  member: MemberInfo;
  onClick?: (member: MemberInfo) => void;
  showClass?: boolean;
  className?: string;
}

const MemberListItem: React.FC<MemberListItemProps> = ({ member, onClick, showClass = true, className }) => {
  const displayName = member.displayName || member.cn;

  const handleClick = () => {
    onClick?.(member);
  };

  const content = (
    <>
      <MemberAvatar name={displayName} />
      <div className="flex-1 overflow-hidden">
        <p className="truncate text-sm font-medium text-background">{displayName}</p>
        {showClass && member.sophomorixAdminClass && (
          <p className="truncate text-xs text-gray-400">{member.sophomorixAdminClass}</p>
        )}
      </div>
    </>
  );

  const baseClasses = cn(
    'flex items-center gap-3 rounded-lg p-2',
    onClick && 'cursor-pointer hover:bg-background/5',
    className,
  );

  if (onClick) {
    return (
      <Button
        type="button"
        onClick={handleClick}
        className={cn(baseClasses, 'w-full text-left')}
      >
        {content}
      </Button>
    );
  }

  return <div className={baseClasses}>{content}</div>;
};

export default MemberListItem;
