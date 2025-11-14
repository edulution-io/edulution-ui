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

import React, { useEffect, useState } from 'react';
import AsyncMultiSelect from '@/components/shared/AsyncMultiSelect';
import MultipleSelectorOptionSH from '@libs/ui/types/multipleSelectorOptionSH';
import LmnApiSearchResult from '@libs/lmnApi/types/lmnApiSearchResult';
import useLmnApiStore from '@/store/useLmnApiStore';
import useClassManagementStore from '@/pages/ClassManagement/useClassManagementStore';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import useLessonStore from '@/pages/ClassManagement/LessonPage/useLessonStore';
import getUniqueValues from '@libs/lmnApi/utils/getUniqueValues';
import useLdapGroups from '@/hooks/useLdapGroups';
import SOPHOMORIX_GROUP_TYPES from '@libs/lmnApi/constants/sophomorixGroupTypes';
import SOPHOMORIX_SCHOOL_CLASS_GROUP_TYPES from '@libs/lmnApi/constants/sophomorixSchoolClassGroupTypes';

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
      (
        [
          SOPHOMORIX_SCHOOL_CLASS_GROUP_TYPES.SCHOOL_CLASS,
          SOPHOMORIX_GROUP_TYPES.STUDENT,
          SOPHOMORIX_GROUP_TYPES.PROJECT,
        ] as string[]
      ).includes(r.type) &&
      (!!r.displayName || !!r.cn) &&
      (!isSuperAdmin || r.sophomorixSchoolname === selectedSchool);

    return result.filter(isValidSearchResult);
  };

  const onUserProjectOrSchoolClassSelect = async (selected: (MultipleSelectorOptionSH & LmnApiSearchResult)[]) => {
    setSelectedValues(selected);
    const newlySelected = selected.filter((g) => !selectedValues.some((sg) => sg.id === g.id));
    const { type, value } = newlySelected[0];

    switch (type) {
      case SOPHOMORIX_SCHOOL_CLASS_GROUP_TYPES.SCHOOL_CLASS: {
        const schoolClass = await fetchSchoolClass(value);
        if (schoolClass) {
          setMember(getUniqueValues([...member, ...schoolClass.members]));
        }
        break;
      }
      case SOPHOMORIX_GROUP_TYPES.STUDENT: {
        const student = await fetchUser(value);
        if (student) {
          setMember(getUniqueValues([...member, student]));
        }
        break;
      }
      case SOPHOMORIX_GROUP_TYPES.PROJECT: {
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
