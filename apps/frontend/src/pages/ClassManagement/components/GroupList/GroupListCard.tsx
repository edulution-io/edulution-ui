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

import React, { useEffect, useState } from 'react';

import { Card, CardContent } from '@/components/shared/Card';
import cn from '@libs/common/utils/className';
import Checkbox from '@/components/ui/Checkbox';
import { MdLock } from 'react-icons/md';
import UserGroups from '@libs/groups/types/userGroups.enum';
import getUserRegex from '@libs/lmnApi/constants/userRegex';
import useLmnApiStore from '@/store/useLmnApiStore';
import useLessonStore from '@/pages/ClassManagement/LessonPage/useLessonStore';
import { useTranslation } from 'react-i18next';
import { FaCog } from 'react-icons/fa';
import LmnApiProject from '@libs/lmnApi/types/lmnApiProject';
import LmnApiSchoolClass from '@libs/lmnApi/types/lmnApiSchoolClass';
import CircleLoader from '@/components/ui/Loading/CircleLoader';
import useClassManagementStore from '@/pages/ClassManagement/useClassManagementStore';
import removeSchoolPrefix from '@libs/classManagement/utils/removeSchoolPrefix';

interface GroupListCardProps {
  group: LmnApiProject | LmnApiSchoolClass;
  type: UserGroups;
  icon: React.ReactElement;
  isEnrolEnabled?: boolean;
}

const GroupListCard: React.FC<GroupListCardProps> = ({ group, type, icon, isEnrolEnabled = false }) => {
  const { t } = useTranslation();
  const { user } = useLmnApiStore();
  const { setOpenDialogType, setUserGroupToEdit, togglePrinterJoined, toggleProjectJoined, toggleSchoolClassJoined } =
    useLessonStore();

  const { fetchUserProjects, fetchUserSchoolClasses, fetchPrinters } = useClassManagementStore();

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
  const [isCardLoading, setIsCardLoading] = useState<boolean>(false);

  const isProject = (g: LmnApiProject | LmnApiSchoolClass): g is LmnApiProject =>
    'sophomorixMemberGroups' in g || 'sophomorixAdminGroups' in g;

  if (!user) {
    return null;
  }

  const userRegex = getUserRegex(user.cn);

  useEffect(() => {
    setIsSelected(!!group.member?.find((m) => userRegex.test(m)));
  }, [group.member, user]);

  const onCardClick = () => {
    if (type === UserGroups.Printers) {
      return;
    }
    setUserGroupToEdit(group);
    setOpenDialogType(type);
  };

  const onSelect = async () => {
    if (!sophomorixJoinable) {
      return;
    }
    setIsCardLoading(true);

    switch (type) {
      case UserGroups.Printers:
        await togglePrinterJoined(isSelected, commonName);
        await fetchPrinters();
        break;
      case UserGroups.Projects:
        await toggleProjectJoined(isSelected, commonName);
        await fetchUserProjects();
        break;
      case UserGroups.Classes:
        await toggleSchoolClassJoined(isSelected, commonName);
        await fetchUserSchoolClasses();
        break;
      default:
    }

    setIsSelected(!isSelected);
    setIsCardLoading(false);
  };

  const isActive = isSelected || isHovered;
  const titleIcon = isEnrolEnabled ? <MdLock className="ml-2 mt-1 h-5 w-5" /> : null;
  const cardContentIcon = isHovered && type !== UserGroups.Printers ? <FaCog className="ml-2 h-7" /> : icon;
  const cardContentText =
    isHovered && type !== UserGroups.Printers ? (
      <div>{t('details')}</div>
    ) : (
      <>
        {type === UserGroups.Projects && isProject(group) ? (
          <div>
            {sophomorixAdmins.length} ({group.sophomorixAdminGroups?.length}){' '}
            {t(sophomorixAdmins.length === 1 ? 'common.adminShort' : 'common.adminsShort')}
          </div>
        ) : null}
        <div>
          {isProject(group)
            ? `${sophomorixMembers.length} (${group.sophomorixMemberGroups?.length})`
            : sophomorixMembers.length}{' '}
          {t(sophomorixMembers.length === 1 ? 'user' : 'common.users')}
        </div>
      </>
    );

  return (
    <Card
      key={commonName}
      variant="text"
      className={cn(
        'my-2 ml-1 mr-4 flex h-20 w-64 min-w-64 cursor-pointer ease-in-out hover:scale-105 lg:transition-transform lg:duration-300',
        isActive && 'opacity-90',
        'cursor-pointer',
      )}
      onClick={onCardClick}
      onMouseOver={() => setIsHovered(true)}
      onMouseOut={() => setIsHovered(false)}
    >
      <CardContent className="relative flex w-full flex-row p-0">
        {isCardLoading ? (
          <CircleLoader className="m-auto" />
        ) : (
          <>
            <div className="flex w-full flex-col justify-around">
              <div className="flew-row flex overflow-hidden">
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
                <div className="ml-2 overflow-hidden whitespace-nowrap text-nowrap text-lg font-bold">
                  {displayName || removeSchoolPrefix(commonName, user.school)}
                </div>
              </div>
              <div className="ml-3 flex h-10 flex-row items-center">
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
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default GroupListCard;
