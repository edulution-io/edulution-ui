import React, { useState } from 'react';
import { Card, CardContent } from '@/components/shared/Card';
import ActionTooltip from '@/pages/FileSharing/utilities/ActionTooltip';
import { TooltipProvider } from '@/components/ui/Tooltip';
import UserLmnInfo from '@libs/lmnApi/types/userInfo';
import cn from '@/lib/utils';
import UserCardButtonBar from '@/pages/ClassManagement/components/UserCard/UserCardButtonBar';

interface UserCardProps {
  user: UserLmnInfo;
  setSelectedMember: React.Dispatch<React.SetStateAction<UserLmnInfo[]>>;
}

const UserCard = ({ user, setSelectedMember }: UserCardProps) => {
  const { displayName, name, sophomorixAdminClass, school, givenName, sn: surname } = user;

  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isSelected, setIsSelected] = useState<boolean>(false);

  const onCardClick = () => {
    setSelectedMember((prevState) => {
      if (isSelected) {
        setIsSelected(false);
        return prevState.filter((m) => m.dn !== user.dn);
      } else {
        setIsSelected(true);
        return [...prevState, user];
      }
    });
  };

  const isActive = isSelected || isHovered;

  return (
    <Card
      variant="security"
      className={cn('my-2 ml-1 mr-4 flex h-64 w-64 min-w-64 cursor-pointer', isActive ? 'opacity-90' : '')}
      onClick={onCardClick}
      onMouseOver={() => setIsHovered(true)}
      onMouseOut={() => setIsHovered(false)}
    >
      <CardContent className="flex w-full flex-row p-0">
        <div className="m-0 flex w-5/6 flex-col justify-between">
          <TooltipProvider>
            <ActionTooltip
              tooltipText={displayName}
              trigger={<h4 className="ml-2 text-lg font-bold">{displayName}</h4>}
            />
          </TooltipProvider>

          <div className="ml-2 flex justify-between">
            <div className={cn('mt-1 h-[26px] rounded-lg px-2 py-0 text-sm', isActive ? 'bg-gray-400' : 'bg-gray-700')}>
              {sophomorixAdminClass}
            </div>
            <div className="flex flex-col text-xs">
              <div>{name}</div>
              <div>{school}</div>
            </div>
          </div>
          <div
            className={cn(
              'mt-1 flex flex-grow items-center justify-center rounded-xl text-2xl',
              isActive ? 'bg-gray-500' : 'bg-gray-800',
            )}
            onClick={(event) => event.stopPropagation()}
          >
            {givenName.slice(0, 1)}
            {surname.slice(0, 1)}
          </div>
        </div>
        <div className="flex w-1/6 flex-col items-center justify-around">
          <UserCardButtonBar
            user={user}
            isActive={isActive}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default UserCard;
