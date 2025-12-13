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
import UserRoles from '@libs/user/constants/userRoles';
import MemberInfo from '@libs/chat/types/memberInfo';
import MemberSection from './MemberSection';

interface MemberListProps {
  members: MemberInfo[];
  searchQuery?: string;
  onMemberClick?: (member: MemberInfo) => void;
  groupByRole?: boolean;
  showClass?: boolean;
  emptyMessage?: string;
}

const MemberList: React.FC<MemberListProps> = ({
  members,
  searchQuery = '',
  onMemberClick,
  groupByRole = true,
  showClass = true,
  emptyMessage,
}) => {
  const { t } = useTranslation();

  const filteredMembers = useMemo(() => {
    const sorted = [...members].sort((a, b) => (a.displayName || a.cn).localeCompare(b.displayName || b.cn));

    if (!searchQuery.trim()) return sorted;

    const query = searchQuery.toLowerCase();
    return sorted.filter(
      (member) => member.displayName?.toLowerCase().includes(query) || member.cn.toLowerCase().includes(query),
    );
  }, [members, searchQuery]);

  const groupedMembers = useMemo(() => {
    if (!groupByRole) {
      return { all: filteredMembers };
    }

    const teachers = filteredMembers.filter((m) => m.sophomorixRole === UserRoles.TEACHER);
    const students = filteredMembers.filter((m) => m.sophomorixRole === UserRoles.STUDENT);
    const others = filteredMembers.filter(
      (m) => m.sophomorixRole !== UserRoles.TEACHER && m.sophomorixRole !== UserRoles.STUDENT,
    );

    return { teachers, students, others };
  }, [filteredMembers, groupByRole]);

  if (filteredMembers.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center text-muted-foreground">
        {emptyMessage || (searchQuery ? t('common.noResults') : t('chat.noMembers'))}
      </div>
    );
  }

  if (!groupByRole) {
    return (
      <MemberSection
        members={groupedMembers.all || []}
        onMemberClick={onMemberClick}
        showClass={showClass}
      />
    );
  }

  const { teachers = [], students = [], others = [] } = groupedMembers;
  const hasRoleGroups = teachers.length > 0 || students.length > 0;

  return (
    <div className="space-y-4">
      {teachers.length > 0 && (
        <MemberSection
          title={t('chat.teachers')}
          members={teachers}
          onMemberClick={onMemberClick}
          showClass={showClass}
        />
      )}

      {students.length > 0 && (
        <MemberSection
          title={t('chat.students')}
          members={students}
          onMemberClick={onMemberClick}
          showClass={showClass}
        />
      )}

      {others.length > 0 && (
        <MemberSection
          title={hasRoleGroups ? t('chat.others') : undefined}
          members={others}
          onMemberClick={onMemberClick}
          showClass={showClass}
        />
      )}
    </div>
  );
};

export default MemberList;
