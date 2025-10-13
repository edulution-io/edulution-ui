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

import React, { useEffect, useState } from 'react';
import AsyncMultiSelect from '@/components/shared/AsyncMultiSelect';
import MultipleSelectorOptionSH from '@libs/ui/types/multipleSelectorOptionSH';
import LmnApiSearchResult from '@libs/lmnApi/types/lmnApiSearchResult';
import useLmnApiStore from '@/store/useLmnApiStore';
import useClassManagementStore from '@/pages/ClassManagement/useClassManagementStore';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import useLessonStore from '@/pages/ClassManagement/LessonPage/useLessonStore';
import {
  SOPHOMORIX_PROJECT,
  SOPHOMORIX_SCHOOL_CLASS,
  SOPHOMORIX_STUDENT,
} from '@libs/lmnApi/constants/sophomorixRoles';
import getUniqueValues from '@libs/lmnApi/utils/getUniqueValues';
import useLdapGroups from '@/hooks/useLdapGroups';

const UserProjectOrSchoolClassSearch = () => {
  const { t } = useTranslation();
  const { member, setMember } = useLessonStore();
  const { user, fetchUser } = useLmnApiStore();
  const { searchGroupsOrUsers, fetchSchoolClass, fetchProject, selectedSchool } = useClassManagementStore();
  const [selectedValues, setSelectedValues] = useState<MultipleSelectorOptionSH[]>([]);
  const { groupName } = useParams();
  const { isSuperAdmin } = useLdapGroups();

  useEffect(() => {
    setSelectedValues(selectedValues.filter((selected) => member.find((m) => m.dn === selected.id)));
  }, [member]);

  const onSearch = async (value: string): Promise<(MultipleSelectorOptionSH & LmnApiSearchResult)[]> => {
    const result = await searchGroupsOrUsers(value, t);

    const isValidSearchResult = (r: MultipleSelectorOptionSH & LmnApiSearchResult) =>
      r.cn !== user?.cn &&
      [SOPHOMORIX_SCHOOL_CLASS, SOPHOMORIX_STUDENT, SOPHOMORIX_PROJECT].includes(r.type) &&
      (!!r.displayName || !!r.cn) &&
      (!isSuperAdmin || r.sophomorixSchoolname === selectedSchool);

    return result.filter(isValidSearchResult);
  };

  const onUserProjectOrSchoolClassSelect = async (selected: (MultipleSelectorOptionSH & LmnApiSearchResult)[]) => {
    setSelectedValues(selected);
    const newlySelected = selected.filter((g) => !selectedValues.some((sg) => sg.id === g.id));
    const { type, value } = newlySelected[0];

    switch (type) {
      case SOPHOMORIX_SCHOOL_CLASS: {
        const schoolClass = await fetchSchoolClass(value);
        if (schoolClass) {
          setMember(getUniqueValues([...member, ...schoolClass.members]));
        }
        break;
      }
      case SOPHOMORIX_STUDENT: {
        const student = await fetchUser(value);
        if (student) {
          setMember(getUniqueValues([...member, student]));
        }
        break;
      }
      case SOPHOMORIX_PROJECT: {
        const project = await fetchProject(value);
        if (project) {
          setMember(getUniqueValues([...member, ...project.members]));
        }
        break;
      }
      default:
    }
  };

  return (
    <AsyncMultiSelect<MultipleSelectorOptionSH & LmnApiSearchResult>
      value={selectedValues as (MultipleSelectorOptionSH & LmnApiSearchResult)[]}
      onSearch={onSearch}
      onChange={onUserProjectOrSchoolClassSelect}
      placeholder={t(
        groupName
          ? 'classmanagement.typeToSearchUsersGroupsProjects'
          : 'classmanagement.typeToSearchUsersGroupsProjectsToNewSession',
      )}
      badgeClassName="hidden"
    />
  );
};

export default UserProjectOrSchoolClassSearch;
