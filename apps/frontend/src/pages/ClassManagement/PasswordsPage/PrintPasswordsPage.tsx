import React, { useEffect, useRef, useState } from 'react';
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
import useScroll from '@/hooks/useScroll';

const PrintPasswordsPage: React.FC = () => {
  const { t } = useTranslation();
  const { getOwnUser, user } = useLmnApiStore();
  const { userSchoolClasses, fetchUserSchoolClasses } = useClassManagementStore();
  const [filterKeyWord, setFilterKeyWord] = useState<string>('');
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isScrolled = useScroll(scrollContainerRef);

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

  return (
    <div
      className="mt-2 max-h-[calc(100vh-50px)] overflow-y-auto scrollbar-thin"
      ref={scrollContainerRef}
    >
      <div className={`sticky top-0 z-10 ${isScrolled ? ' bg-ciDarkGrey pb-1' : ''}`}>
        <Input
          name="filter"
          onChange={(e) => setFilterKeyWord(e.target.value)}
          placeholder={t('classmanagement.typeToFilter')}
          variant="lightGray"
        />
      </div>
      <div className="mt-2 text-lg">{t('classmanagement.printPasswordsPageDescription')}</div>
      {groupRows.map((row) => (
        <div
          key={row.name}
          className="mt-4"
        >
          <h4>{t(`classmanagement.printPasswords`)}</h4>
          <ClassList row={row} />
        </div>
      ))}
    </div>
  );
};

export default PrintPasswordsPage;
