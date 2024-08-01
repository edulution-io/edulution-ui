import React, { useEffect } from 'react';
import useLmnApiStore from '@/store/useLmnApiStore';
import { useTranslation } from 'react-i18next';
import useClassManagementStore from '@/pages/ClassManagement/useClassManagementStore';
import GroupColumn from '@libs/groups/types/groupColumn';
import UserGroups from '@libs/groups/types/userGroups.enum';
import { MdGroups } from 'react-icons/md';
import ClassList from '@/pages/ClassManagement/PasswordsPage/ClassList/ClassList';
import getUserRegex from '@libs/lmnApi/constants/userRegex';

const PrintPasswordsPage: React.FC = () => {
  const { t } = useTranslation();
  const { getOwnUser, user } = useLmnApiStore();
  const { userSchoolClasses, fetchUserSchoolClasses } = useClassManagementStore();

  useEffect(() => {
    void getOwnUser();
    void fetchUserSchoolClasses();
  }, []);

  if (!user) {
    return null;
  }

  const userRegex = getUserRegex(user.cn);

  const groupRows: GroupColumn[] = [
    {
      name: UserGroups.Classes,
      translationId: 'myClasses',
      icon: <MdGroups className="h-7 w-7" />,
      groups: userSchoolClasses.filter((group) => group.member?.find((member) => userRegex.test(member))),
    },
  ];

  return (
    <div className="mt-6">
      {groupRows.map((row) => (
        <div key={row.name}>
          <h4>{t(`classmanagement.printPasswords`)}</h4>
          <ClassList row={row} />
        </div>
      ))}
    </div>
  );
};

export default PrintPasswordsPage;
