import React, { useEffect, useState } from 'react';
import AsyncMultiSelect from '@/components/shared/AsyncMultiSelect';
import MultipleSelectorOptionSH from '@libs/ui/types/multipleSelectorOptionSH';
import LmnApiSearchResult from '@libs/lmnApi/types/lmnApiSearchResult';
import useLmnApiStore from '@/store/lmnApiStore';
import useClassManagementStore from '@/pages/ClassManagement/useClassManagementStore';
import UserLmnInfo from '@libs/lmnApi/types/userInfo';
import { useTranslation } from 'react-i18next';
import LmnApiSchoolClass from '@libs/lmnApi/types/lmnApiSchoolClass';
import LmnApiProject from '@libs/lmnApi/types/lmnApiProject';

interface Props {
  setMember: React.Dispatch<React.SetStateAction<UserLmnInfo[]>>;
  member: UserLmnInfo[];
}

const UserProjectOrSchoolClassSearch = ({ setMember, member }: Props) => {
  const { t } = useTranslation();
  const { user, fetchUser } = useLmnApiStore();
  const { searchGroupsOrUsers, fetchSchoolClass, fetchProject } = useClassManagementStore();
  const [selectedValues, setSelectedValues] = useState<MultipleSelectorOptionSH[]>([]);

  useEffect(() => {
    selectedValues.filter((selected) => member.find((m) => m.dn === selected.id));
  }, [member]);

  const onSearch = async (value: string): Promise<(MultipleSelectorOptionSH & LmnApiSearchResult)[]> => {
    const result = await searchGroupsOrUsers(value);

    const isValidSearchResult = (r: MultipleSelectorOptionSH & LmnApiSearchResult) =>
      r.cn !== user?.cn && ['schoolclass', 'student', 'project'].includes(r.type) && !!r.displayName;
    return result.filter(isValidSearchResult);
  };

  const getUniqueValues = (values: (UserLmnInfo | LmnApiSchoolClass | LmnApiProject)[]) => {
    return Array.from(new Set(values.map((obj) => JSON.stringify(obj)))).map((str) => JSON.parse(str));
  };

  const onUserProjectOrSchoolClassSelect = async (selected: (MultipleSelectorOptionSH & LmnApiSearchResult)[]) => {
    setSelectedValues(selected);
    const newlySelected = selected.filter((g) => !selectedValues.some((sg) => sg.id === g.id));
    const { type, value } = newlySelected[0];

    switch (type) {
      case 'schoolclass':
        const schoolClass = await fetchSchoolClass(value);
        if (schoolClass) {
          setMember((prevState) => getUniqueValues([...prevState, ...schoolClass.member]));
        }
        break;
      case 'student':
        const student = await fetchUser(value);
        if (student) {
          setMember((prevState) => getUniqueValues([...prevState, student]));
        }
        break;
      case 'project':
        const project = await fetchProject(value);
        if (project) {
          setMember((prevState) => getUniqueValues([...prevState, ...project.member]));
        }
        break;
      default:
    }
  };

  return (
    <AsyncMultiSelect<MultipleSelectorOptionSH & LmnApiSearchResult>
      value={selectedValues as (MultipleSelectorOptionSH & LmnApiSearchResult)[]}
      onSearch={onSearch}
      onChange={onUserProjectOrSchoolClassSelect}
      placeholder={t('classmanagement.type-to-search-users-groups-projects')}
      badgeClassName="hidden"
    />
  );
};

export default UserProjectOrSchoolClassSearch;
