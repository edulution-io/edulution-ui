import React, { useEffect, useState } from 'react';
import useLmnApiStore from '@/store/useLmnApiStore';
import { useTranslation } from 'react-i18next';
import useClassManagementStore from '@/pages/ClassManagement/useClassManagementStore';
import GroupColumn from '@libs/groups/types/groupColumn';
import UserGroups from '@libs/groups/types/userGroups.enum';
import { MdGroups } from 'react-icons/md';
import ClassList from '@/pages/ClassManagement/PasswordsPage/ClassList/ClassList';
import getUserRegex from '@libs/lmnApi/constants/userRegex';
import Input from '@/components/shared/Input';
import LmnApiSchoolClass from '@libs/lmnApi/types/lmnApiSchoolClass';
import { FILTER_BAR_ID } from '@libs/classManagement/constants/pageElementIds';
import useElementHeight from '@/hooks/useElementHeight';

import { FLOATING_BUTTONS_BAR_ID, FOOTER_ID } from '@libs/common/constants/pageElementIds';

const PrintPasswordsPage: React.FC = () => {
  const { t } = useTranslation();
  const { getOwnUser, user } = useLmnApiStore();
  const { userSchoolClasses, fetchUserSchoolClasses } = useClassManagementStore();
  const [filterKeyWord, setFilterKeyWord] = useState<string>('');
  const [selectedClasses, setSelectedClasses] = useState<LmnApiSchoolClass[]>([]);

  useEffect(() => {
    void getOwnUser();
    void fetchUserSchoolClasses();
  }, []);

  if (!user) {
    return null;
  }

  const userRegex = getUserRegex(user.cn);

  const filterSchoolClasses = (schoolClass: LmnApiSchoolClass) =>
    schoolClass.member?.find((member) => userRegex.test(member)) &&
    (schoolClass.cn.includes(filterKeyWord) || schoolClass.displayName.includes(filterKeyWord));

  const groupRows: GroupColumn[] = [
    {
      name: UserGroups.Classes,
      translationId: 'myClasses',
      icon: <MdGroups className="h-7 w-7" />,
      groups: userSchoolClasses.filter(filterSchoolClasses),
    },
  ];

  const pageBarsHeight = useElementHeight([FLOATING_BUTTONS_BAR_ID, FILTER_BAR_ID, FOOTER_ID], selectedClasses) + 10;

  return (
    <div>
      <Input
        name="filter"
        onChange={(e) => setFilterKeyWord(e.target.value)}
        placeholder={t('classmanagement.typeToFilter')}
        variant="lightGray"
        id={FILTER_BAR_ID}
        className="my-2"
      />
      <div
        className="flex max-w-full flex-wrap overflow-y-auto overflow-x-visible scrollbar-thin"
        style={{ maxHeight: `calc(100vh - ${pageBarsHeight}px)` }}
      >
        <div className="mt-2 text-lg">{t('classmanagement.printPasswordsPageDescription')}</div>
        {groupRows.map((row) => (
          <div
            key={row.name}
            className="mt-4"
          >
            <h4>{t(`classmanagement.printPasswords`)}</h4>
            <ClassList
              row={row}
              selectedClasses={selectedClasses}
              setSelectedClasses={setSelectedClasses}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default PrintPasswordsPage;
