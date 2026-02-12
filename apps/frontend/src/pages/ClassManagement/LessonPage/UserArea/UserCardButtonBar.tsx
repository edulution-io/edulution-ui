/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
 *
 * This software is dual-licensed under the terms of:
 *
 * 1. The GNU Affero General Public License (AGPL-3.0-or-later), as published by the Free Software Foundation.
 *    You may use, modify and distribute this software under the terms of the AGPL, provided that you comply with its conditions.
 *
 *    A copy of the license can be found at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * OR
 *
 * 2. A commercial license agreement with Netzint GmbH. Licensees holding a valid commercial license from Netzint GmbH
 *    may use this software in accordance with the terms contained in such written agreement, without the obligations imposed by the AGPL.
 *
 * If you are uncertain which license applies to your use case, please contact us at info@netzint.de for clarification.
 */

import React from 'react';
import type LmnUserInfo from '@libs/lmnApi/types/lmnUserInfo';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faRightToBracket,
  faEarthAmericas,
  faEye,
  faFilter,
  faKey,
  faPrint,
  faGraduationCap,
  faWifi,
  IconDefinition,
} from '@fortawesome/free-solid-svg-icons';
import useLessonStore from '@/pages/ClassManagement/LessonPage/useLessonStore';
import DropdownMenu from '@/components/shared/DropdownMenu';
import { cn } from '@edulution-io/ui-kit';
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
  icon: IconDefinition;
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
      icon: faWifi,
      value: wifi,
      title: CLASSMGMT_OPTIONS.WIFI,
      variant: 'button',
      disabled,
    },
    { icon: faFilter, value: webfilter, title: CLASSMGMT_OPTIONS.WEBFILTER, variant: 'button', disabled },
    { icon: faEarthAmericas, value: internet, title: CLASSMGMT_OPTIONS.INTERNET, variant: 'button', disabled },
    { icon: faPrint, value: printing, title: CLASSMGMT_OPTIONS.PRINTING, variant: 'button', disabled },
    { icon: faGraduationCap, value: examMode, title: CLASSMGMT_OPTIONS.EXAMMODE, variant: 'button', disabled },
    {
      icon: faEye,
      value: null,
      title: CLASSMGMT_OPTIONS.VEYON,
      variant: 'dropdown',
      defaultColor: 'text-ciLightGrey',
      disabled,
    },
    isTeacherInSameClass
      ? {
          icon: faKey,
          value: null,
          title: CLASSMGMT_OPTIONS.PASSWORDOPTIONS,
          variant: 'button',
          defaultColor: 'text-ciLightGrey',
          disabled,
        }
      : {
          icon: faRightToBracket,
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
          className={cn(button.disabled && 'cursor-not-allowed', 'relative')}
          onClick={(e) => onButtonClick(e, button)}
          disabled={button.disabled}
        >
          <FontAwesomeIcon
            icon={button.icon}
            className={cn(
              button.disabled && 'text-ciGrey dark:text-ciDarkGrey',
              !button.disabled && button.value !== null && 'text-ciGreen',
              !button.disabled && button.value === false && 'text-ciRed',
            )}
          />
          <div
            className={cn(
              'absolute -right-[5px] top-1/2 hidden -translate-y-1/2 items-center justify-center whitespace-nowrap rounded-l-[8px] bg-ciGreenToBlue px-2 py-1 text-white',
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
            <div className={cn('relative', !isVeyonButtonEnabled && 'cursor-not-allowed')}>
              <FontAwesomeIcon
                icon={button.icon}
                className={cn(
                  veyonIsActive && !button.disabled ? button.defaultColor : 'text-ciGrey dark:text-ciDarkGrey',
                )}
              />

              {isVeyonButtonEnabled && (
                <div className="absolute -right-[5px] top-1/2 hidden -translate-y-1/2 items-center justify-center whitespace-nowrap rounded-l-[8px] bg-ciGreenToBlue px-2 py-1 text-background group-hover:flex">
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
