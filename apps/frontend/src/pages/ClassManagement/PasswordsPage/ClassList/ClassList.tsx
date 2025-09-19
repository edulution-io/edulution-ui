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
import LmnApiSchoolClass from '@libs/lmnApi/types/lmnApiSchoolClass';
import GroupColumn from '@libs/groups/types/groupColumn';
import PasswordsFloatingButtonsBar from '@/pages/ClassManagement/PasswordsPage/PasswordsFloatingButtonsBar';
import ClassListCard from '@/pages/ClassManagement/PasswordsPage/ClassList/ClassListCard';
import { useTranslation } from 'react-i18next';

interface EnrolGroupListProps {
  row: GroupColumn;
  selectedClasses: LmnApiSchoolClass[];
  setSelectedClasses: React.Dispatch<React.SetStateAction<LmnApiSchoolClass[]>>;
  activeSchool: string | null;
}

const ClassList = ({ row, selectedClasses, setSelectedClasses, activeSchool }: EnrolGroupListProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-row flex-wrap">
      {row.groups.length ? (
        row.groups.map((group) => (
          <ClassListCard
            key={(group as LmnApiSchoolClass).dn}
            group={group as LmnApiSchoolClass}
            selectedClasses={selectedClasses}
            setSelectedClasses={setSelectedClasses}
            disabled={!!activeSchool && (group as LmnApiSchoolClass).sophomorixSchoolname !== activeSchool}
          />
        ))
      ) : (
        <div className="mt-3">{t('classmanagement.notMemberOfClass')}</div>
      )}

      <PasswordsFloatingButtonsBar selectedClasses={selectedClasses} />
    </div>
  );
};

export default ClassList;
