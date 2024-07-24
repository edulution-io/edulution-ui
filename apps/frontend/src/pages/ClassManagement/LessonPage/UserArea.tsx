import React, { useState } from 'react';
import UserCard from '@/pages/ClassManagement/components/UserCard/UserCard';
import UserLmnInfo from '@libs/lmnApi/types/userInfo';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

interface UserAreaProps {
  member: UserLmnInfo[];
}

const UserArea = ({ member }: UserAreaProps) => {
  const { t } = useTranslation();
  const [selectedMember, setSelectedMember] = useState<UserLmnInfo[]>([]);
  const { groupName } = useParams();

  return (
    <div className="mt-3">
      <h3 className="mb-2 text-center">
        {member.length} {t('classmanagement.studentsInThisSession')}
        {groupName ? ': ' + groupName : ''}
        {selectedMember.length ? (
          <span className="ml-4 text-lg">
            ({selectedMember.length} {t('common.selected')})
          </span>
        ) : null}
      </h3>
      <div className="flex flex-wrap">
        {member.map((student, index) => (
          <UserCard
            key={index}
            user={student}
            setSelectedMember={setSelectedMember}
          />
        ))}
      </div>
    </div>
  );
};

export default UserArea;
