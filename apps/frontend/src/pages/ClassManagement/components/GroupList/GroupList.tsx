/*
 * LICENSE
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
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
