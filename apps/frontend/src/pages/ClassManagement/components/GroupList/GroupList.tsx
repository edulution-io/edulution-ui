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
import LmnApiProject from '@libs/lmnApi/types/lmnApiProject';
import LmnApiSchoolClass from '@libs/lmnApi/types/lmnApiSchoolClass';
import GroupDialog from '@/pages/ClassManagement/components/GroupDialog/GroupDialog';
import GroupColumn from '@libs/groups/types/groupColumn';
import GroupListCard from '@/pages/ClassManagement/components/GroupList/GroupListCard';
import { useTranslation } from 'react-i18next';
import useLessonStore from '@/pages/ClassManagement/LessonPage/useLessonStore';
import useLdapGroups from '@/hooks/useLdapGroups';
import useClassManagementStore from '../../useClassManagementStore';

interface GroupListProps {
  row: GroupColumn;
  isEnrolEnabled?: boolean;
}

const GroupList = ({ row, isEnrolEnabled }: GroupListProps) => {
  const { t } = useTranslation();
  const { openDialogType } = useLessonStore();
  const { selectedSchool } = useClassManagementStore();
  const { isSuperAdmin } = useLdapGroups();

  return (
    <div className="flex flex-row flex-wrap">
      {row.groups.length ? (
        row.groups
          .filter(
            (group) =>
              !isSuperAdmin || (group as LmnApiProject | LmnApiSchoolClass).sophomorixSchoolname === selectedSchool,
          )
          .map((group) => (
            <GroupListCard
              key={row.name + (group as LmnApiProject | LmnApiSchoolClass).dn}
              group={group as LmnApiProject | LmnApiSchoolClass}
              type={row.name}
              icon={row.icon}
              isEnrolEnabled={isEnrolEnabled}
            />
          ))
      ) : (
        <div className="mt-3">{t('classmanagement.noGroupsToShow')}</div>
      )}
      {openDialogType === row.name && <GroupDialog item={row} />}
    </div>
  );
};

export default GroupList;
