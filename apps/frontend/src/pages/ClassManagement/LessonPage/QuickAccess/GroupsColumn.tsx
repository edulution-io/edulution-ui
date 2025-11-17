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
import { useTranslation } from 'react-i18next';
import GroupCard from '@/pages/ClassManagement/LessonPage/QuickAccess/GroupCard';
import GroupColumn from '@libs/groups/types/groupColumn';
import useUserStore from '@/store/UserStore/useUserStore';
import CircleLoader from '@/components/ui/Loading/CircleLoader';
import LmnApiProject from '@libs/lmnApi/types/lmnApiProject';
import LmnApiSchoolClass from '@libs/lmnApi/types/lmnApiSchoolClass';

interface GroupsColumnProps {
  column: GroupColumn;
}

const GroupsColumn = ({ column }: GroupsColumnProps) => {
  const { t } = useTranslation();
  const { user } = useUserStore();
  const { name, translationId, icon, groups, isLoading } = column;

  if (!groups || !Array.isArray(groups)) {
    return null;
  }

  const groupCards = groups.map((group) => (
    <GroupCard
      type={name}
      key={user!.username + group.name}
      group={group as LmnApiProject | LmnApiSchoolClass}
      icon={icon}
    />
  ));

  const getContent = () => {
    if (groupCards.length) {
      return groupCards;
    }
    if (isLoading) {
      return <CircleLoader />;
    }
    return <p>{t('classmanagement.noneAvailable')}</p>;
  };

  return (
    <>
      <h3 className="mb-4 whitespace-nowrap text-center">{t(`classmanagement.${translationId}`)}</h3>
      <div className="flex flex-wrap justify-center gap-4">{getContent()}</div>
      <div className="mt-1 flex justify-center" />
    </>
  );
};

export default GroupsColumn;
