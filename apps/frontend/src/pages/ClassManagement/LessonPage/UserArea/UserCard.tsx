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

import React, { useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/shared/Card';
import UserLmnInfo from '@libs/lmnApi/types/userInfo';
import cn from '@libs/common/utils/className';
import UserCardButtonBar from '@/pages/ClassManagement/LessonPage/UserArea/UserCardButtonBar';
import Checkbox from '@/components/ui/Checkbox';
import { SOPHOMORIX_STUDENT } from '@libs/lmnApi/constants/sophomorixRoles';
import Avatar from '@/components/shared/Avatar';
import { useTranslation } from 'react-i18next';
import UserPasswordDialog from '@/pages/ClassManagement/LessonPage/UserArea/UserPasswordDialog/UserPasswordDialog';
import useLmnApiPasswordStore from '@/pages/ClassManagement/LessonPage/UserArea/UserPasswordDialog/useLmnApiPasswordStore';
import getExtendedOptionsValue from '@libs/appconfig/utils/getExtendedOptionsValue';
import useAppConfigsStore from '@/pages/Settings/AppConfig/appConfigsStore';
import APPS from '@libs/appconfig/constants/apps';
import ExtendedOptionKeys from '@libs/appconfig/constants/extendedOptionKeys';
import FrameBufferImage from './FrameBufferImage';

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
  const { displayName, name, sophomorixAdminClass, school, givenName, sn: surname, thumbnailPhoto, examMode } = user;
  const { appConfigs } = useAppConfigsStore();
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const studentName = examMode ? name + '-exam' : name;

  const isStudent = user.sophomorixRole === SOPHOMORIX_STUDENT;
  const isSelectable = isTeacherInSameSchool && isStudent;
  const isMemberSelected = !!selectedMember.find((m) => m.dn === user.dn) && isSelectable;

  const isActive = isHovered || isMemberSelected;

  const isVeyonEnabled = useMemo(() => {
    const veyonConfigs = getExtendedOptionsValue(appConfigs, APPS.CLASS_MANAGEMENT, ExtendedOptionKeys.VEYON_PROXYS);
    return Array.isArray(veyonConfigs) && veyonConfigs.length > 0;
  }, [appConfigs]);

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
      className={cn('my-2 ml-1 mr-4 flex h-64 min-w-80 cursor-pointer', isActive && 'opacity-90')}
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

          <div className="-my-1 ml-2 flex justify-between">
            <div className={cn('mt-1 h-6 rounded-lg px-2 py-0 text-sm', isActive ? 'bg-gray-400' : 'bg-gray-700')}>
              {sophomorixAdminClass}
            </div>
            <div className={cn('flex flex-col text-xs', !isSelectable && 'mr-2')}>
              <div>{studentName}</div>
              <div>{school}</div>
            </div>
          </div>
          <div
            className={cn(
              'm-2 flex max-h-36 w-64 flex-grow items-center justify-center rounded-xl text-2xl',
              isActive ? 'bg-muted' : 'bg-accent',
            )}
          >
            {isVeyonEnabled && user.sophomorixIntrinsic3.length > 0 ? (
              <FrameBufferImage user={user} />
            ) : (
              <Avatar
                user={{ username: studentName, firstName: givenName, lastName: surname }}
                imageSrc={thumbnailPhoto}
                className={thumbnailPhoto && 'h-24 w-24 p-2'}
              />
            )}
          </div>
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
