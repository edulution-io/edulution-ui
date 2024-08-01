import React, { useEffect } from 'react';
import useLmnApiStore from '@/store/useLmnApiStore';
import { useTranslation } from 'react-i18next';
import useClassManagementStore from '@/pages/ClassManagement/useClassManagementStore';
import GroupList from '@/pages/ClassManagement/components/GroupList/GroupList';
import GroupColumn from '@libs/groups/types/groupColumn';
import UserGroups from '@libs/groups/types/userGroups.enum';
import { MdGroups } from 'react-icons/md';
import { FaUsersGear } from 'react-icons/fa6';
import LoadingIndicator from '@/components/shared/LoadingIndicator';

const EnrolPage: React.FC = () => {
  const { t } = useTranslation();
  const { getOwnUser, user } = useLmnApiStore();
  const { userProjects, userSchoolClasses, fetchUserProjects, fetchUserSchoolClasses, isLoading } =
    useClassManagementStore();

  useEffect(() => {
    void getOwnUser();
    void fetchUserProjects();
    void fetchUserSchoolClasses();
  }, []);

  if (!user) {
    return null;
  }

  const groupRows: GroupColumn[] = [
    {
      name: UserGroups.Classes,
      translationId: 'myClasses',
      icon: <MdGroups className="h-7 w-7" />,
      groups: userSchoolClasses,
    },
    {
      name: UserGroups.Projects,
      translationId: 'myProjects',
      icon: <FaUsersGear className="h-5 w-7" />,
      groups: userProjects,
    },
  ];

  return (
    <div className="mt-6">
      <div className="text-lg">{t('classmanagement.enrolPageDescription')}</div>
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
