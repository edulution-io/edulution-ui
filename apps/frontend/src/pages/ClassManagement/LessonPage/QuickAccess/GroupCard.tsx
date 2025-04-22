/*
 * LICENSE
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import React, { ReactElement, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/shared/Card';
import ActionTooltip from '@/components/shared/ActionTooltip';
import { TooltipProvider } from '@/components/ui/Tooltip';
import UserGroups from '@libs/groups/types/userGroups.enum';
import { MdPlayArrow } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { CLASS_MANAGEMENT_LESSON_PATH } from '@libs/classManagement/constants/classManagementPaths';
import LmnApiSchoolClass from '@libs/lmnApi/types/lmnApiSchoolClass';
import LmnApiProject from '@libs/lmnApi/types/lmnApiProject';
import LmnApiSession from '@libs/lmnApi/types/lmnApiSession';
import STUDENTS_REGEX from '@libs/lmnApi/constants/studentsRegex';

interface GroupCardProps {
  icon?: ReactElement;
  type: UserGroups;
  group: LmnApiSession | LmnApiProject | LmnApiSchoolClass;
}

const GroupCard = ({ icon, type, group }: GroupCardProps) => {
  const { t } = useTranslation();
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const navigate = useNavigate();

  if (!group) {
    return null;
  }

  const member =
    (group as LmnApiSession).members?.map((m) => m.dn) || (group as LmnApiSchoolClass | LmnApiProject).member;
  const memberCount = member.filter((m) => STUDENTS_REGEX.test(m))?.length || 0;

  const onCardClick = () => {
    navigate(`/${CLASS_MANAGEMENT_LESSON_PATH}/${type}/${group.name}`);
  };

  const title = (group as LmnApiSchoolClass).displayName || group.name?.replace('p_', '');

  return (
    <Card
      variant="text"
      className="h-24 w-48 min-w-48 cursor-pointer ease-in-out hover:scale-110 lg:transition-transform lg:duration-300"
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
      </CardContent>
    </Card>
  );
};

export default GroupCard;
