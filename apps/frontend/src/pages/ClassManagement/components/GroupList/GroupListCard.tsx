import React, { useEffect, useState } from 'react';

import { Card, CardContent } from '@/components/shared/Card';
import cn from '@/lib/utils';
import Checkbox from '@/components/ui/Checkbox';
import { TooltipProvider } from '@/components/ui/Tooltip';
import ActionTooltip from '@/components/shared/ActionTooltip';
import { MdLock } from 'react-icons/md';
import UserGroups from '@libs/groups/types/userGroups.enum';
import getUserRegex from '@libs/lmnApi/constants/userRegex';
import useLmnApiStore from '@/store/useLmnApiStore';
import useLessonStore from '@/pages/ClassManagement/LessonPage/useLessonStore';
import { useTranslation } from 'react-i18next';
import { FaCog } from 'react-icons/fa';
import LmnApiProject from '@libs/lmnApi/types/lmnApiProject';
import LmnApiSchoolClass from '@libs/lmnApi/types/lmnApiSchoolClass';

interface GroupListCardProps {
  group: LmnApiProject | LmnApiSchoolClass;
  type: UserGroups;
  icon: React.ReactElement;
  isEnrolEnabled?: boolean;
}

const GroupListCard: React.FC<GroupListCardProps> = ({ group, type, icon, isEnrolEnabled = false }) => {
  const { t } = useTranslation();
  const { user } = useLmnApiStore();
  const { setOpenDialogType, setUserGroupToEdit } = useLessonStore();
  const {
    displayName,
    cn: commonName,
    sophomorixSchoolname,
    sophomorixJoinable,
    sophomorixAdmins,
    sophomorixMembers,
  } = group;
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isSelected, setIsSelected] = useState<boolean>(false);

  if (!user) {
    return null;
  }

  const userRegex = getUserRegex(user.cn);

  useEffect(() => {
    setIsSelected(!!group.member?.find((m) => userRegex.test(m)));
  }, [group.member, user]);

  const onCardClick = () => {
    setUserGroupToEdit(group);
    setOpenDialogType(type);
  };

  const onSelect = () => {
    if (!sophomorixJoinable) {
      return;
    }
    if (isSelected) {
      setIsSelected(false);
      // Will be implemented in NIEDUUI-358
    } else {
      setIsSelected(true);
      // Will be implemented in NIEDUUI-358
    }
  };

  const isActive = isSelected || isHovered;
  const titleIcon = isEnrolEnabled ? <MdLock className="ml-2 mt-1 h-5 w-5" /> : null;
  const cardContentIcon = isHovered ? <FaCog /> : icon;
  const cardContentText = isHovered ? (
    <div className="flex h-10 items-center">{t('details')}</div>
  ) : (
    <>
      {type === UserGroups.Projects ? (
        <div>
          {sophomorixAdmins.length} {t(sophomorixAdmins.length === 1 ? 'common.adminShort' : 'common.adminsShort')}
        </div>
      ) : null}
      <div>
        {sophomorixMembers.length} {t(sophomorixMembers.length === 1 ? 'user' : 'common.users')}
      </div>
    </>
  );

  return (
    <Card
      key={commonName}
      variant="security"
      className={cn(
        'my-2 ml-1 mr-4 flex h-20 w-64 min-w-64 rounded-lg border',
        isActive && 'opacity-90',
        'cursor-pointer',
      )}
      onClick={onCardClick}
      onMouseOver={() => setIsHovered(true)}
      onMouseOut={() => setIsHovered(false)}
    >
      <CardContent className="relative flex w-full flex-row p-0">
        <div className="flex w-full flex-col justify-around">
          <div className="flew-row flex ">
            {sophomorixJoinable && isEnrolEnabled ? (
              <Checkbox
                className="-mr-1 ml-2 rounded-lg"
                checked={isSelected}
                onCheckedChange={onSelect}
                aria-label="Select"
                onClick={(e) => e.stopPropagation()}
                onMouseOver={(e) => e.stopPropagation()}
              />
            ) : (
              titleIcon
            )}
            <TooltipProvider>
              <ActionTooltip
                tooltipText={displayName || commonName}
                trigger={
                  <div className="ml-2 overflow-hidden whitespace-nowrap text-nowrap text-lg font-bold">
                    {displayName || commonName.replace('p_', '')}
                  </div>
                }
              />
            </TooltipProvider>
          </div>
          <div className="ml-3 flex flex-row items-center">
            {cardContentIcon}
            <div className="ml-2  text-sm">{cardContentText}</div>
          </div>
        </div>
        <div
          className={cn(
            'absolute bottom-2 right-2 mt-1 h-[26px] flex-col items-center justify-around rounded-lg px-2 py-0 text-sm',
            isActive ? 'bg-gray-400' : 'bg-gray-700',
          )}
        >
          {sophomorixSchoolname}
        </div>
      </CardContent>
    </Card>
  );
};

export default GroupListCard;
