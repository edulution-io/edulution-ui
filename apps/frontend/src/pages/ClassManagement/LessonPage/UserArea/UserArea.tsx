import React, { useState } from 'react';
import UserCard from '@/pages/ClassManagement/LessonPage/UserArea/UserCard';
import UserLmnInfo from '@libs/lmnApi/types/userInfo';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import LessonFloatingButtonsBar from '@/pages/ClassManagement/LessonPage/LessonFloatingButtonsBar';
import useLessonStore from '@/pages/ClassManagement/LessonPage/useLessonStore';
import { SOPHOMORIX_STUDENT } from '@libs/lmnApi/constants/sophomorixRoles';
import sortByName from '@libs/common/utils/sortByName';

interface UserAreaProps {
  fetchData: () => Promise<void>;
}

const UserArea = ({ fetchData }: UserAreaProps) => {
  const { t } = useTranslation();
  const { member } = useLessonStore();
  const [selectedMember, setSelectedMember] = useState<UserLmnInfo[]>([]);
  const { groupName } = useParams();

  const getSelectedStudents = () => {
    if (selectedMember.length) {
      return selectedMember.filter((m) => m.sophomorixRole === SOPHOMORIX_STUDENT);
    }
    return member.filter((m) => m.sophomorixRole === SOPHOMORIX_STUDENT);
  };

  return (
    <div className="mt-3 h-full">
      <h3 className="mb-2 text-center">
        {member.length} {t('classmanagement.usersInThisSession')}
        {groupName ? `: ${groupName}` : ''}
        {selectedMember.length ? (
          <span className="ml-4 text-lg">
            ({selectedMember.length} {t('common.selected')})
          </span>
        ) : null}
      </h3>
      <div className="flex max-h-[calc(100vh-240px)] max-w-full flex-wrap overflow-scroll">
        {member.sort(sortByName).map((m) => (
          <UserCard
            key={m.dn}
            user={m}
            setSelectedMember={setSelectedMember}
            fetchData={fetchData}
          />
        ))}
      </div>
      <LessonFloatingButtonsBar
        member={getSelectedStudents()}
        fetchData={fetchData}
      />
    </div>
  );
};

export default UserArea;
