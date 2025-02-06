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

import React from 'react';
import { FaWifi } from 'react-icons/fa';
import UserLmnInfo from '@libs/lmnApi/types/userInfo';
import { useTranslation } from 'react-i18next';
import { FiPrinter } from 'react-icons/fi';
import { IconType } from 'react-icons';
import { MdSchool } from 'react-icons/md';
import { FaArrowRightToBracket, FaEarthAmericas } from 'react-icons/fa6';
import { TbFilterCode } from 'react-icons/tb';
import useLessonStore from '@/pages/ClassManagement/LessonPage/useLessonStore';
import cn from '@libs/common/utils/className';
import { PiEyeFill, PiKey } from 'react-icons/pi';
import { useParams } from 'react-router-dom';
import useLmnApiStore from '@/store/useLmnApiStore';
import useLmnApiPasswordStore from '@/pages/ClassManagement/LessonPage/UserArea/UserPasswordDialog/useLmnApiPasswordStore';
import CLASSMGMT_OPTIONS from '@libs/classManagement/constants/classmgmtOptions';
import ClassmgmtOptionsType from '@libs/classManagement/types/classmgmtOptionsType';

interface UserCardButtonBarProps {
  user: UserLmnInfo;
  isTeacherInSameClass: boolean;
}

interface UserCardButton {
  icon: IconType;
  value: boolean | null;
  title: ClassmgmtOptionsType;
  defaultColor?: string;
}

const UserCardButtonBar = ({ user, isTeacherInSameClass }: UserCardButtonBarProps) => {
  const { t } = useTranslation();
  const { fetchUser, schoolPrefix } = useLmnApiStore();
  const {
    addManagementGroup,
    removeManagementGroup,
    startExamMode,
    stopExamMode,
    member,
    setMember,
    toggleSchoolClassJoined,
  } = useLessonStore();
  const { internet, printing, examMode, webfilter, wifi, cn: commonName } = user;
  const { groupType, groupName } = useParams();
  const { setCurrentUser } = useLmnApiPasswordStore();

  const onButtonClick = async (event: React.MouseEvent<HTMLElement>, button: UserCardButton) => {
    event.stopPropagation();

    const users = [user.cn];

    if (button.title === CLASSMGMT_OPTIONS.VEYON) {
      // eslint-disable-next-line no-alert
      alert(t('classmanagement.featureIsStillInDevelopment')); // Will be implemented in NIEDUUI-359
    } else if (button.title === CLASSMGMT_OPTIONS.EXAMMODE) {
      if (button.value) {
        await stopExamMode(users, groupType, groupName);
      } else {
        await startExamMode(users);
      }
    } else if (button.title === CLASSMGMT_OPTIONS.JOINCLASS) {
      await toggleSchoolClassJoined(false, user.sophomorixAdminClass);
    } else if (button.title === CLASSMGMT_OPTIONS.PASSWORDOPTIONS) {
      setCurrentUser(user);
      return;
    } else if (button.value) {
      await removeManagementGroup(`${schoolPrefix}${button.title}`, users);
    } else {
      await addManagementGroup(`${schoolPrefix}${button.title}`, users);
    }

    const updatedUser = await fetchUser(commonName);
    if (!updatedUser) return;
    setMember([...member.filter((m) => m.cn !== commonName), updatedUser]);
  };

  const booleanButtons: UserCardButton[] = [
    {
      icon: FaWifi,
      value: wifi,
      title: CLASSMGMT_OPTIONS.WIFI,
    },
    { icon: TbFilterCode, value: webfilter, title: CLASSMGMT_OPTIONS.WEBFILTER },
    { icon: FaEarthAmericas, value: internet, title: CLASSMGMT_OPTIONS.INTERNET },
    { icon: FiPrinter, value: printing, title: CLASSMGMT_OPTIONS.PRINTING },
    { icon: MdSchool, value: examMode, title: CLASSMGMT_OPTIONS.EXAMMODE },
    { icon: PiEyeFill, value: null, title: CLASSMGMT_OPTIONS.VEYON, defaultColor: 'bg-gray-600' },
    { icon: PiKey, value: null, title: CLASSMGMT_OPTIONS.PASSWORDOPTIONS, defaultColor: 'bg-gray-600' },
  ];

  const getButtonDescription = (isEnabled: boolean | null) => {
    if (isEnabled === null) {
      return '';
    }
    return isEnabled ? 'classmanagement.disable' : 'classmanagement.enable';
  };

  if (!isTeacherInSameClass) {
    booleanButtons.push({
      icon: FaArrowRightToBracket,
      value: null,
      title: CLASSMGMT_OPTIONS.JOINCLASS,
      defaultColor: 'bg-ciRed',
    });
  }

  return booleanButtons.map((button) => (
    <div
      key={button.title}
      className="group relative"
    >
      <button
        type="button"
        className={cn(
          'relative rounded-full p-1.5',
          'group-hover:bg-accent group-hover:text-background',
          button.defaultColor || (button.value ? 'bg-ciGreen text-background' : 'bg-ciRed'),
        )}
        title={t(button.title)}
        onClick={(e) => onButtonClick(e, button)}
      >
        <button.icon className="text-lg" />
        <div className="absolute right-0 top-0 hidden h-full items-center justify-center whitespace-nowrap rounded-xl bg-accent px-2 text-background group-hover:flex">
          {t(`classmanagement.${button.title}`)} {t(getButtonDescription(button.value))}
        </div>
      </button>
    </div>
  ));
};

export default UserCardButtonBar;
