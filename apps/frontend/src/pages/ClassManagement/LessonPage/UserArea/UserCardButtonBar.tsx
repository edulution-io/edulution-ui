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

import React, { useEffect } from 'react';
import { FaWifi } from 'react-icons/fa';
import UserLmnInfo from '@libs/lmnApi/types/userInfo';
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

interface UserCardButtonBarProps {
  user: UserLmnInfo;
  isTeacherInSameClass: boolean;
}

interface UserCardButton {
  icon: IconType;
  value: boolean | null;
  title: ClassmgmtOptionsType;
  variant: 'button' | 'dropdown';
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
  const { userConnectionUids, userConnectionsFeatureStates, setFeatureIsLoading, setFeature, getFeatures } =
    useVeyonApiStore();
  const connectionUid = userConnectionUids.find((conn) => conn.veyonUsername === user.cn)?.connectionUid || '';
  const veyonIsActive = !!connectionUid;
  const userConnectionFeatureState = userConnectionsFeatureStates[connectionUid];

  const getFeatureState = (featureUid: string) => {
    const feature = userConnectionFeatureState?.find((item) => item.uid === featureUid);
    return feature ? feature.active : undefined;
  };

  useEffect(() => {
    if (connectionUid) {
      void getFeatures(connectionUid);
    }
  }, [connectionUid]);

  const isScreenLocked = !!getFeatureState(VEYON_FEATURE_ACTIONS.SCREENLOCK);
  const areInputDevicesLocked = !!getFeatureState(VEYON_FEATURE_ACTIONS.INPUT_DEVICES_LOCK);

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
  };

  const userCardButtons: UserCardButton[] = [
    {
      icon: FaWifi,
      value: wifi,
      title: CLASSMGMT_OPTIONS.WIFI,
      variant: 'button',
    },
    { icon: TbFilterCode, value: webfilter, title: CLASSMGMT_OPTIONS.WEBFILTER, variant: 'button' },
    { icon: FaEarthAmericas, value: internet, title: CLASSMGMT_OPTIONS.INTERNET, variant: 'button' },
    { icon: FiPrinter, value: printing, title: CLASSMGMT_OPTIONS.PRINTING, variant: 'button' },
    { icon: MdSchool, value: examMode, title: CLASSMGMT_OPTIONS.EXAMMODE, variant: 'button' },
    {
      icon: PiEyeFill,
      value: null,
      title: CLASSMGMT_OPTIONS.VEYON,
      variant: 'dropdown',
      defaultColor: 'text-ciLightGrey',
    },
    {
      icon: PiKey,
      value: null,
      title: CLASSMGMT_OPTIONS.PASSWORDOPTIONS,
      variant: 'button',
      defaultColor: 'text-ciLightGrey',
    },
  ];

  const getButtonDescription = (isEnabled: boolean | null) => {
    if (isEnabled === null) {
      return '';
    }
    return isEnabled ? 'classmanagement.disable' : 'classmanagement.enable';
  };

  if (!isTeacherInSameClass) {
    userCardButtons.push({
      icon: FaArrowRightToBracket,
      value: null,
      title: CLASSMGMT_OPTIONS.JOINCLASS,
      variant: 'button',
      defaultColor: 'text-ciLightGrey',
    });
  }

  const handleSetVeyonFeature = (featureUid: string, active: boolean) => {
    void setFeature(connectionUid, featureUid, active);
  };

  return userCardButtons.map((button) =>
    button.variant === 'button' ? (
      <div
        key={button.title}
        className="group relative"
      >
        <button
          type="button"
          className={cn(
            'relative p-2 hover:bg-ciGreenToBlue',
            'group-hover:bg-ciGreenToBlue group-hover:text-background',
          )}
          title={t(button.title)}
          onClick={(e) => onButtonClick(e, button)}
        >
          <button.icon
            className={cn('text-lg', button.defaultColor || (button.value ? 'text-ciGreen' : 'text-ciRed'))}
          />
          <div className="absolute -right-[5px] top-0 hidden h-full items-center justify-center whitespace-nowrap rounded-l-[8px] bg-ciGreenToBlue px-2 text-background group-hover:flex">
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
          disabled={!veyonIsActive || setFeatureIsLoading.has(connectionUid)}
          trigger={
            <div
              className={cn(
                'relative p-2 ',
                veyonIsActive && 'group-hover:bg-ciGreenToBlue group-hover:text-background hover:bg-ciGreenToBlue',
              )}
              title={t(button.title)}
            >
              <button.icon className={cn('text-lg', veyonIsActive ? button.defaultColor : 'text-ciDarkGrey')} />

              {veyonIsActive && (
                <div className="absolute -right-[5px] top-0 hidden h-full items-center justify-center whitespace-nowrap rounded-l-[8px] bg-ciGreenToBlue px-2 text-background group-hover:flex">
                  {t(`classmanagement.${button.title}`)} {t(getButtonDescription(button.value))}
                </div>
              )}
            </div>
          }
          items={[
            {
              label: t(isScreenLocked ? 'veyon.unlockScreen' : 'veyon.lockScreen'),
              onClick: () => handleSetVeyonFeature(VEYON_FEATURE_ACTIONS.SCREENLOCK, !isScreenLocked),
            },
            {
              label: t(areInputDevicesLocked ? 'veyon.unlockInputDevices' : 'veyon.lockInputDevices'),
              onClick: () => handleSetVeyonFeature(VEYON_FEATURE_ACTIONS.INPUT_DEVICES_LOCK, !areInputDevicesLocked),
            },
            { label: 'veyonSeparater', isSeparator: true },
            {
              label: t('veyon.rebootSystem'),
              onClick: () => handleSetVeyonFeature(VEYON_FEATURE_ACTIONS.REBOOT, true),
            },
            {
              label: t('veyon.powerDown'),
              onClick: () => handleSetVeyonFeature(VEYON_FEATURE_ACTIONS.POWER_DOWN, true),
            },
          ]}
        />
      </div>
    ),
  );
};

export default UserCardButtonBar;
