import React, { useEffect, useState } from 'react';
import AsyncMultiSelect from '@/components/shared/AsyncMultiSelect';
import MultipleSelectorOptionSH from '@libs/ui/types/multipleSelectorOptionSH';
import LmnApiSearchResult from '@libs/lmnApi/types/lmnApiSearchResult';
import useLmnApiStore from '@/store/useLmnApiStore';
import useClassManagementStore from '@/pages/ClassManagement/useClassManagementStore';
import UserLmnInfo from '@libs/lmnApi/types/userInfo';
import { useTranslation } from 'react-i18next';
import LmnApiSchoolClass from '@libs/lmnApi/types/lmnApiSchoolClass';
import LmnApiProject from '@libs/lmnApi/types/lmnApiProject';
import { useParams } from 'react-router-dom';
import useLessonStore from '@/pages/ClassManagement/LessonPage/useLessonStore';
import {
  SOPHOMORIX_PROJECT,
  SOPHOMORIX_SCHOOL_CLASS,
  SOPHOMORIX_STUDENT,
} from '@libs/lmnApi/constants/sophomorixRoles';

const UserProjectOrSchoolClassSearch = () => {
  const { t } = useTranslation();
  const { member, setMember } = useLessonStore();
  const { user, fetchUser } = useLmnApiStore();
  const { searchGroupsOrUsers, fetchSchoolClass, fetchProject } = useClassManagementStore();
  const [selectedValues, setSelectedValues] = useState<MultipleSelectorOptionSH[]>([]);
  const { groupName } = useParams();

  useEffect(() => {
    setSelectedValues(selectedValues.filter((selected) => member.find((m) => m.dn === selected.id)));
  }, [member]);

  const onSearch = async (value: string): Promise<(MultipleSelectorOptionSH & LmnApiSearchResult)[]> => {
    const result = await searchGroupsOrUsers(value);

    const isValidSearchResult = (r: MultipleSelectorOptionSH & LmnApiSearchResult) =>
      r.cn !== user?.cn &&
      [SOPHOMORIX_SCHOOL_CLASS, SOPHOMORIX_STUDENT, SOPHOMORIX_PROJECT].includes(r.type) &&
      !!(r.displayName || r.cn);
    return result.filter(isValidSearchResult);
  };

  const getUniqueValues = <T extends UserLmnInfo | LmnApiSchoolClass | LmnApiProject>(values: T[]): T[] => {
    const uniqueValuesSet = new Set<string>(values.map((obj) => JSON.stringify(obj)));
    return Array.from(uniqueValuesSet).map((str) => JSON.parse(str) as T);
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
