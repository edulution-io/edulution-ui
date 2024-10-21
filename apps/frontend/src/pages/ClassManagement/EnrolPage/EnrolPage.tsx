import React, { useEffect, useRef, useState } from 'react';
import useLmnApiStore from '@/store/useLmnApiStore';
import { useTranslation } from 'react-i18next';
import useClassManagementStore from '@/pages/ClassManagement/useClassManagementStore';
import GroupList from '@/pages/ClassManagement/components/GroupList/GroupList';
import GroupColumn from '@libs/groups/types/groupColumn';
import UserGroups from '@libs/groups/types/userGroups.enum';
import { MdGroups } from 'react-icons/md';
import { FaPrint, FaUsersGear } from 'react-icons/fa6';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import Input from '@/components/shared/Input';
import LmnApiSchoolClass from '@libs/lmnApi/types/lmnApiSchoolClass';
import LmnApiProject from '@libs/lmnApi/types/lmnApiProject';
import LmnApiPrinter from '@libs/lmnApi/types/lmnApiPrinter';
import useScroll from '@/hooks/useScroll';

const EnrolPage: React.FC = () => {
  const { t } = useTranslation();
  const { getOwnUser, user } = useLmnApiStore();
  const {
    userProjects,
    userSchoolClasses,
    fetchUserProjects,
    fetchUserSchoolClasses,
    isLoading,
    printers,
    fetchPrinters,
  } = useClassManagementStore();
  const [filterKeyWord, setFilterKeyWord] = useState<string>('');
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isScrolled = useScroll(scrollContainerRef);

  useEffect(() => {
    void getOwnUser();
    void fetchUserProjects();
    void fetchPrinters();
    void fetchUserSchoolClasses();
  }, []);

  if (!user) {
    return null;
  }

  const filterGroups = (group: LmnApiProject | LmnApiSchoolClass | LmnApiPrinter) =>
    group.cn.includes(filterKeyWord) || group.displayName.includes(filterKeyWord);

  const groupRows: GroupColumn[] = [
    {
      name: UserGroups.Classes,
      translationId: 'myClasses',
      icon: <MdGroups className="h-7 w-7" />,
      groups: userSchoolClasses.filter(filterGroups),
    },
    {
      name: UserGroups.Printers,
      translationId: 'printers',
      icon: <FaPrint className="h-5 w-7" />,
      groups: printers.filter(filterGroups),
    },
    {
      name: UserGroups.Projects,
      translationId: 'myProjects',
      icon: <FaUsersGear className="h-5 w-7" />,
      groups: userProjects.filter(filterGroups),
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
      <div className="mt-2 text-lg">{t('classmanagement.enrolPageDescription')}</div>
      <LoadingIndicator isOpen={isLoading} />
      {groupRows.map((row) => (
        <div
          key={row.name}
          className="mt-4"
        >
          <h4>{t(`classmanagement.${row.name}`)}</h4>
          <GroupList
            row={row}
            isEnrolEnabled
          />
        </div>
      ))}
    </div>
  );
};

export default EnrolPage;
