import React, { useState } from 'react';
import { Card, CardContent } from '@/components/shared/Card';
import UserLmnInfo from '@libs/lmnApi/types/userInfo';
import cn from '@/lib/utils';
import UserCardButtonBar from '@/pages/ClassManagement/LessonPage/UserArea/UserCardButtonBar';
import Checkbox from '@/components/ui/Checkbox';
import { SOPHOMORIX_STUDENT } from '@libs/lmnApi/constants/sophomorixRoles';

interface UserCardProps {
  user: UserLmnInfo;
  setSelectedMember: React.Dispatch<React.SetStateAction<UserLmnInfo[]>>;
  fetchData: () => Promise<void>;
}

const UserCard = ({ user, setSelectedMember, fetchData }: UserCardProps) => {
  const { displayName, name, sophomorixAdminClass, school, givenName, sn: surname } = user;

  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isSelected, setIsSelected] = useState<boolean>(false);

  const isStudent = user.sophomorixRole === SOPHOMORIX_STUDENT;

  const onCardClick = () => {
    if (!isStudent) return;

    setSelectedMember((prevState) => {
      if (isSelected) {
        setIsSelected(false);
        return prevState.filter((m) => m.dn !== user.dn);
      }
      setIsSelected(true);
      return [...prevState, user];
    });
  };

  const isActive = isSelected || isHovered;

  return (
    <Card
      variant="security"
      className={cn('my-2 ml-1 mr-4 flex h-64 w-64 min-w-64 cursor-pointer', isActive && 'opacity-90')}
      onClick={onCardClick}
      onMouseOver={() => setIsHovered(true)}
      onMouseOut={() => setIsHovered(false)}
    >
      <CardContent className="flex w-full flex-row p-0">
        <div className={cn('m-0 flex flex-col justify-between', isStudent ? 'w-5/6' : 'w-full')}>
          <div className="flew-row flex h-8">
            {isStudent ? (
              <Checkbox
                className="ml-2 rounded-lg"
                checked={isSelected}
                onCheckedChange={onCardClick}
                aria-label="Select row"
              />
            ) : null}
            <div className={cn('text-md mt-1 h-8 w-44 font-bold', !isStudent && 'ml-2')}>{displayName}</div>
          </div>

          <div className="-mt-1 ml-2 flex justify-between">
            <div className={cn('mt-1 h-[26px] rounded-lg px-2 py-0 text-sm', isActive ? 'bg-gray-400' : 'bg-gray-700')}>
              {sophomorixAdminClass}
            </div>
            <div className={cn('flex flex-col text-xs', !isStudent && 'mr-2')}>
              <div>{name}</div>
              <div>{school}</div>
            </div>
          </div>
          <button
            type="button"
            className={cn(
              'mt-1 flex flex-grow items-center justify-center rounded-xl text-2xl',
              isActive ? 'bg-gray-500' : 'bg-gray-800',
            )}
            onClick={(event) => event.stopPropagation()}
          >
            {givenName.slice(0, 1)}
            {surname.slice(0, 1)}
          </button>
        </div>
        {isStudent ? (
          <div className="mt-0.5 flex w-1/6 flex-col items-center justify-around">
            <UserCardButtonBar
              user={user}
              fetchData={fetchData}
            />
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
};

export default UserCard;
