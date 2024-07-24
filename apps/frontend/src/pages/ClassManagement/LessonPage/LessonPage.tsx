import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import FavoriteGroups from '@/pages/ClassManagement/LessonPage/FavoriteGroups';
import UserLmnInfo from '@libs/lmnApi/types/userInfo';
import UserProjectOrSchoolClassSearch from '@/pages/ClassManagement/LessonPage/UserProjectOrSchoolClassSearch';
import useClassManagementStore from '@/pages/ClassManagement/useClassManagementStore';
import UserArea from '@/pages/ClassManagement/LessonPage/UserArea';

const LessonPage = () => {
  const { userSessions, userSchoolClasses, userProjects } = useClassManagementStore();
  const [member, setMember] = useState<UserLmnInfo[]>([]);
  const { groupType, groupName } = useParams();

  useEffect(() => {
    switch (groupType) {
      case 'projects':
        setMember(userProjects.find((project) => project.cn === groupName)?.member || []);
        return;
      case 'sessions':
        setMember(userSessions.find((session) => session.name === groupName)?.member || []);
        return;
      case 'classes':
        setMember(userSchoolClasses.find((schoolClass) => schoolClass.cn === groupName)?.member || []);
        return;
      default:
    }
  }, [groupType, groupName]);

  useEffect(() => {
    if (!groupName) {
      setMember([]);
    }
  }, [groupType, groupName]);

  return (
    <div>
      <div>
        <UserProjectOrSchoolClassSearch
          setMember={setMember}
          member={member}
        />
      </div>
      <div>{member.length ? <UserArea member={member} /> : <FavoriteGroups />}</div>
    </div>
  );
};

export default LessonPage;
