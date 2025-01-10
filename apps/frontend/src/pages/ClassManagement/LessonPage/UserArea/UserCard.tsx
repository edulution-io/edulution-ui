import React, { useState } from 'react';
import { Card, CardContent } from '@/components/shared/Card';
import UserLmnInfo from '@libs/lmnApi/types/userInfo';
import cn from '@libs/common/utils/className';
import UserCardButtonBar from '@/pages/ClassManagement/LessonPage/UserArea/UserCardButtonBar';
import Checkbox from '@/components/ui/Checkbox';
import { SOPHOMORIX_STUDENT } from '@libs/lmnApi/constants/sophomorixRoles';
import { useTranslation } from 'react-i18next';
import UserPasswordDialog from '@/pages/ClassManagement/LessonPage/UserArea/UserPasswordDialog/UserPasswordDialog';
import useLmnApiPasswordStore from '@/pages/ClassManagement/LessonPage/UserArea/UserPasswordDialog/useLmnApiPasswordStore';

interface UserCardProps {
  user: UserLmnInfo;
  selectedMember: UserLmnInfo[];
  setSelectedMember: React.Dispatch<React.SetStateAction<UserLmnInfo[]>>;
  isTeacherInSameClass: boolean;
  isTeacherInSameSchool: boolean;
}

const UserCard = ({
  user,
  selectedMember,
  setSelectedMember,
  isTeacherInSameClass,
  isTeacherInSameSchool,
}: UserCardProps) => {
  const { t } = useTranslation();
  const { currentUser } = useLmnApiPasswordStore();
  const { displayName, name, sophomorixAdminClass, school, givenName, sn: surname } = user;

  const [isHovered, setIsHovered] = useState<boolean>(false);

  const isStudent = user.sophomorixRole === SOPHOMORIX_STUDENT;
  const isSelectable = isTeacherInSameSchool && isStudent;
  const isMemberSelected = !!selectedMember.find((m) => m.dn === user.dn) && isSelectable;

  const isActive = isHovered || isMemberSelected;

  const onCardClick = () => {
    if (!isStudent) {
      // eslint-disable-next-line no-alert
      alert(t('classmanagement.itsNotPossibleToEditOtherTeacher'));
      return;
    }
    if (!isTeacherInSameSchool) {
      // eslint-disable-next-line no-alert
      alert(t('classmanagement.itsNotPossibleToEditOtherSchoolStudents'));
      return;
    }

    setSelectedMember(() => {
      if (isMemberSelected) {
        return selectedMember.filter((m) => m.dn !== user.dn);
      }
      return [...selectedMember, user];
    });
  };

  return (
    <Card
      variant="security"
      className={cn('my-2 ml-1 mr-4 flex h-64 w-64 min-w-64 cursor-pointer', isActive && 'opacity-90')}
      onClick={onCardClick}
      onMouseOver={() => setIsHovered(true)}
      onMouseOut={() => setIsHovered(false)}
    >
      <CardContent className="flex w-full flex-row p-0">
        <div className={cn('m-0 flex flex-col justify-between', isSelectable ? 'w-5/6' : 'w-full')}>
          <div className="flew-row flex h-8">
            {isSelectable && (
              <Checkbox
                className="ml-2 rounded-lg"
                checked={isMemberSelected}
                onCheckedChange={onCardClick}
                aria-label={t('select')}
              />
            )}
            <div className={cn('text-md mt-1 h-8 w-44 font-bold', !isSelectable && 'ml-2')}>{displayName}</div>
          </div>

          <div className="-mt-1 ml-2 flex justify-between">
            <div className={cn('mt-1 h-6 rounded-lg px-2 py-0 text-sm', isActive ? 'bg-gray-400' : 'bg-gray-700')}>
              {sophomorixAdminClass}
            </div>
            <div className={cn('flex flex-col text-xs', !isSelectable && 'mr-2')}>
              <div>{name}</div>
              <div>{school}</div>
            </div>
          </div>
          <button
            type="button"
            className={cn(
              'mt-1 flex flex-grow items-center justify-center rounded-xl text-2xl',
              isActive ? 'bg-muted' : 'bg-accent',
            )}
            onClick={(event) => event.stopPropagation()}
          >
            {givenName.slice(0, 1)}
            {surname.slice(0, 1)}
          </button>
        </div>
        {isSelectable ? (
          <div className="mt-0.5 flex w-1/6 flex-col items-center justify-around">
            <UserCardButtonBar
              user={user}
              isTeacherInSameClass={isTeacherInSameClass}
            />
          </div>
        ) : null}
      </CardContent>
      {currentUser?.dn === user.dn && <UserPasswordDialog />}
    </Card>
  );
};

export default UserCard;
