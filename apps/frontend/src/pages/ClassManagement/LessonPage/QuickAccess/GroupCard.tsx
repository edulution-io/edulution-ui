import React, { ReactElement, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/shared/Card';
import ActionTooltip from '@/components/shared/ActionTooltip';
import { TooltipProvider } from '@/components/ui/Tooltip';
import { FaCog } from 'react-icons/fa';
import UserGroups from '@libs/groups/types/userGroups.enum';
import { MdPlayArrow } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { CLASS_MANAGEMENT_LESSON_PATH } from '@libs/classManagement/constants/classManagementPaths';
import LmnApiSchoolClass from '@libs/lmnApi/types/lmnApiSchoolClass';
import LmnApiProject from '@libs/lmnApi/types/lmnApiProject';
import LmnApiSession from '@libs/lmnApi/types/lmnApiSession';
import STUDENTS_REGEX from '@libs/lmnApi/constants/studentsRegex';
import useLessonStore from '@/pages/ClassManagement/LessonPage/useLessonStore';

interface GroupCardProps {
  icon?: ReactElement;
  type: UserGroups;
  group: LmnApiSession | LmnApiProject | LmnApiSchoolClass;
  setIsDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const GroupCard = ({ icon, type, group, setIsDialogOpen }: GroupCardProps) => {
  const { t } = useTranslation();
  const { setOpenDialogType, setUserGroupToEdit } = useLessonStore();
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const navigate = useNavigate();

  if (!group) {
    return null;
  }

  const member =
    (group as LmnApiSession).members?.map((m) => m.dn) || (group as LmnApiSchoolClass | LmnApiProject).member;
  const memberCount = member.filter((m) => STUDENTS_REGEX.test(m))?.length || 0;

  const onEditHover = (event: React.KeyboardEvent | React.FocusEvent | React.MouseEvent) => {
    event.stopPropagation();
    setIsHovered(false);
  };

  const onEditClick = (event: React.KeyboardEvent | React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setIsDialogOpen(true);
    setUserGroupToEdit(group);
    setOpenDialogType(type);
  };

  const onCardClick = () => {
    navigate(`/${CLASS_MANAGEMENT_LESSON_PATH}/${type}/${group.name}`);
  };

  const title = group.name;

  return (
    <Card
      variant="security"
      className="h-24 w-48 min-w-48 cursor-pointer hover:opacity-90"
      onClick={onCardClick}
      onMouseOver={() => setIsHovered(true)}
      onMouseOut={() => setIsHovered(false)}
    >
      <CardContent className="p-3">
        <div className="flex w-full flex-col gap-4">
          <TooltipProvider>
            <ActionTooltip
              tooltipText={title}
              trigger={<p className="overflow-hidden text-ellipsis text-nowrap text-lg font-bold">{title}</p>}
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
                    {memberCount} {t(memberCount === 1 ? 'student' : 'students')}
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
        {type !== UserGroups.Room ? (
          <button
            onClick={onEditClick}
            onMouseOver={onEditHover}
            onFocus={onEditHover}
            className="absolute -bottom-1 -right-1 rounded-2xl p-2  hover:bg-ciLightBlue"
            type="button"
          >
            <FaCog />
          </button>
        ) : null}
      </CardContent>
    </Card>
  );
};

export default GroupCard;
