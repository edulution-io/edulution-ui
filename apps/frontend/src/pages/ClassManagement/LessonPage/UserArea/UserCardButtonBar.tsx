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
import type LmnUserInfo from '@libs/lmnApi/types/lmnUserInfo';
import { useTranslation } from 'react-i18next';
import { FiPrinter } from 'react-icons/fi';
import { IconType } from 'react-icons';
import { MdSchool } from 'react-icons/md';
import { FaArrowRightToBracket, FaEarthAmericas } from 'react-icons/fa6';
import { TbFilterCode } from 'react-icons/tb';
import useLessonStore from '@/pages/ClassManagement/LessonPage/useLessonStore';
import DropdownMenu from '@/components/shared/DropdownMenu';
import cn from '@libs/common/utils/className';
import { PiEyeFill, PiKey } from 'react-icons/pi';
import { useParams } from 'react-router-dom';
import useLmnApiStore from '@/store/useLmnApiStore';
import useLmnApiPasswordStore from '@/pages/ClassManagement/LessonPage/UserArea/UserPasswordDialog/useLmnApiPasswordStore';
import CLASSMGMT_OPTIONS from '@libs/classManagement/constants/classmgmtOptions';
import ClassmgmtOptionsType from '@libs/classManagement/types/classmgmtOptionsType';
import VEYON_FEATURE_ACTIONS from '@libs/veyon/constants/veyonFeatureActions';
import useVeyonApiStore from '../../useVeyonApiStore';
import useVeyonFeatures from './useVeyonFeatures';

interface UserCardButtonBarProps {
  user: LmnUserInfo;
  isTeacherInSameClass: boolean;
  isScreenLocked: boolean;
  areInputDevicesLocked: boolean;
  disabled: boolean;
}

interface UserCardButton {
  icon: IconType;
  value: boolean | null;
  title: ClassmgmtOptionsType;
  variant: 'button' | 'dropdown';
  disabled: boolean;
  defaultColor?: string;
}

const UserCardButtonBar = ({
  user,
  isTeacherInSameClass,
  isScreenLocked,
  areInputDevicesLocked,
  disabled,
}: UserCardButtonBarProps) => {
  const { t } = useTranslation();
  const { fetchUser, schoolPrefix, getOwnUser } = useLmnApiStore();
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
  const { userConnectionUids, loadingFeatureUids } = useVeyonApiStore();
  const { handleSetVeyonFeature } = useVeyonFeatures();

  const connectionUid = userConnectionUids.find((conn) => conn.veyonUsername === user.cn)?.connectionUid || '';
  const veyonIsActive = !!connectionUid;

  const onButtonClick = async (event: React.MouseEvent<HTMLElement>, button: UserCardButton) => {
    event.stopPropagation();

    const users = [user.cn];

    if (button.title === CLASSMGMT_OPTIONS.EXAMMODE) {
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

    await getOwnUser();
  };

  const userCardButtons: UserCardButton[] = [
    {
      icon: FaWifi,
      value: wifi,
      title: CLASSMGMT_OPTIONS.WIFI,
      variant: 'button',
      disabled,
    },
    { icon: TbFilterCode, value: webfilter, title: CLASSMGMT_OPTIONS.WEBFILTER, variant: 'button', disabled },
    { icon: FaEarthAmericas, value: internet, title: CLASSMGMT_OPTIONS.INTERNET, variant: 'button', disabled },
    { icon: FiPrinter, value: printing, title: CLASSMGMT_OPTIONS.PRINTING, variant: 'button', disabled },
    { icon: MdSchool, value: examMode, title: CLASSMGMT_OPTIONS.EXAMMODE, variant: 'button', disabled },
    {
      icon: PiEyeFill,
      value: null,
      title: CLASSMGMT_OPTIONS.VEYON,
      variant: 'dropdown',
      defaultColor: 'text-ciLightGrey',
      disabled,
    },
    isTeacherInSameClass
      ? {
          icon: PiKey,
          value: null,
          title: CLASSMGMT_OPTIONS.PASSWORDOPTIONS,
          variant: 'button',
          defaultColor: 'text-ciLightGrey',
          disabled,
        }
      : {
          icon: FaArrowRightToBracket,
          value: null,
          title: CLASSMGMT_OPTIONS.JOINCLASS,
          variant: 'button',
          defaultColor: 'text-ciLightGrey',
          disabled: false,
        },
  ];

  const getButtonDescription = (isEnabled: boolean | null) => {
    if (isEnabled === null) {
      return '';
    }
    return isEnabled ? 'classmanagement.disable' : 'classmanagement.enable';
  };

  const isVeyonButtonEnabled = !disabled && veyonIsActive && !loadingFeatureUids.has(connectionUid);

  return userCardButtons.map((button) =>
    button.variant === 'button' ? (
      <div
        key={button.title}
        className="group relative"
      >
        <button
          type="button"
          className={cn(button.disabled && 'cursor-not-allowed', 'relative p-2')}
          onClick={(e) => onButtonClick(e, button)}
          disabled={button.disabled}
        >
          <button.icon
            className={cn(
              'text-lg',
              button.disabled && 'text-ciDarkGrey',
              !button.disabled && button.value !== null && 'text-ciGreen',
              !button.disabled && button.value === false && 'text-ciRed',
            )}
          />
          <div
            className={cn(
              'absolute -right-[5px] top-0 hidden h-full items-center justify-center whitespace-nowrap rounded-l-[8px] bg-ciGreenToBlue px-2 text-background ',
              !button.disabled && 'group-hover:flex',
            )}
          >
            {t(`classmanagement.${button.title}`)} {t(getButtonDescription(button.value))}
          </div>
        </button>
      </div>
    ) : (
      <div
        key={button.title}
        className="group relative"
      >
        <DropdownMenu
          menuContentClassName="z-[600]"
          disabled={!isVeyonButtonEnabled}
          trigger={
            <div className={cn('relative p-2', !isVeyonButtonEnabled && 'cursor-not-allowed')}>
              <button.icon
                className={cn('text-lg', veyonIsActive && !button.disabled ? button.defaultColor : 'text-ciDarkGrey')}
              />

              {isVeyonButtonEnabled && (
                <div className="absolute -right-[5px] top-0 hidden h-full items-center justify-center whitespace-nowrap rounded-l-[8px] bg-ciGreenToBlue px-2 text-background group-hover:flex">
                  {t(`classmanagement.${button.title}`)} {t(getButtonDescription(button.value))}
                </div>
              )}
            </div>
          }
          items={[
            {
              label: t(isScreenLocked ? 'veyon.unlockScreen' : 'veyon.lockScreen'),
              onClick: () => handleSetVeyonFeature([connectionUid], VEYON_FEATURE_ACTIONS.SCREENLOCK, !isScreenLocked),
            },
            {
              label: t(areInputDevicesLocked ? 'veyon.unlockInputDevices' : 'veyon.lockInputDevices'),
              onClick: () =>
                handleSetVeyonFeature(
                  [connectionUid],
                  VEYON_FEATURE_ACTIONS.INPUT_DEVICES_LOCK,
                  !areInputDevicesLocked,
                ),
            },
            { label: 'veyonSeparater', isSeparator: true },
            {
              label: t('veyon.rebootSystem'),
              onClick: () => handleSetVeyonFeature([connectionUid], VEYON_FEATURE_ACTIONS.REBOOT, true),
            },
            {
              label: t('veyon.powerDown'),
              onClick: () => handleSetVeyonFeature([connectionUid], VEYON_FEATURE_ACTIONS.POWER_DOWN, true),
            },
          ]}
        />
      </div>
    ),
  );
};

export default UserCardButtonBar;
