import React, { ReactElement, useState } from 'react';
import { useTranslation } from 'react-i18next';
import GroupDto from '@libs/groups/types/group.dto';
import { Card, CardContent } from '@/components/shared/Card';
import ActionTooltip from '@/pages/FileSharing/utilities/ActionTooltip';
import { TooltipProvider } from '@/components/ui/Tooltip';
import Session from '@libs/classManagement/types/session';
import { FaCog } from 'react-icons/fa';
import UserGroups from '@libs/groups/types/userGroups.enum';
import { MdPlayArrow } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { CLASS_MANAGEMENT_LESSON_PATH } from '@libs/classManagement/constants/classManagementPaths';
import LmnApiSchoolClass from '@libs/lmnApi/types/lmnApiSchoolClass';
import LmnApiProject from '@libs/lmnApi/types/lmnApiProject';
import LmnApiSession from '@libs/lmnApi/types/lmnApiSession';

interface GroupCardProps {
  icon?: ReactElement;
  type: UserGroups;
  group: LmnApiSession | LmnApiProject | LmnApiSchoolClass;
  setUserGroupToEdit: React.Dispatch<React.SetStateAction<Session | GroupDto | null>>;
  setOpenDialogType: React.Dispatch<React.SetStateAction<UserGroups | null>>;
}

const GroupCard = ({ icon, type, group, setOpenDialogType }: GroupCardProps) => {
  const { t } = useTranslation();
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const navigate = useNavigate();

  if (!group) {
    return null;
  }

  const memberCount = group.member.length;

  const onEditHover = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setIsHovered(false);
  };

  const onEditClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setOpenDialogType(type);
  };

  const onCardClick = () => {
    navigate(`/${CLASS_MANAGEMENT_LESSON_PATH}/${type}/${group.name}`);
  };

  const title = group.name;

  return (
    <Card
      variant="security"
      className="h-28 w-48 min-w-48 cursor-pointer hover:opacity-90"
      onClick={onCardClick}
      onMouseOver={() => setIsHovered(true)}
      onMouseOut={() => setIsHovered(false)}
    >
      <CardContent className="p-3">
        <div className="flex flex-col gap-6">
          <TooltipProvider>
            <ActionTooltip
              tooltipText={title}
              trigger={<p className="overflow-hidden text-ellipsis text-lg font-bold">{title}</p>}
            />
          </TooltipProvider>
          <div className="flex flex-row items-center">
            {isHovered ? <MdPlayArrow className="h-7 w-7" /> : icon}
            <div className="ml-2 flex-grow">
              <p className="text-sm">
                {isHovered ? (
                  <>{t('classmanagement.startSession')}</>
                ) : (
                  <>
                    {memberCount} {t(memberCount === 1 ? 'classmanagement.member' : 'classmanagement.members')}
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
        <div
          onClick={onEditClick}
          onMouseOver={onEditHover}
          className="absolute -bottom-1 -right-1 rounded-2xl p-2  hover:bg-ciLightBlue"
        >
          <FaCog />
        </div>
      </CardContent>
    </Card>
  );
};

export default GroupCard;
