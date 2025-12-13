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
import MemberInfo from '@libs/chat/types/memberInfo';
import MemberListItem from '@/pages/Chat/components/MemberListItem';

interface MemberSectionProps {
  title?: string;
  members: MemberInfo[];
  onMemberClick?: (member: MemberInfo) => void;
  showClass?: boolean;
}

const MemberSection: React.FC<MemberSectionProps> = ({ title, members, onMemberClick, showClass = true }) => {
  if (members.length === 0) return null;

  return (
    <div>
      {title && <h3 className="mb-2 text-sm font-medium text-gray-400">{title}</h3>}
      <div className="space-y-1">
        {members.map((member) => (
          <MemberListItem
            key={member.cn}
            member={member}
            onClick={onMemberClick}
            showClass={showClass}
          />
        ))}
      </div>
    </div>
  );
};

export default MemberSection;
