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

import React, { useState } from 'react';
import { MdSchool } from 'react-icons/md';
import { t } from 'i18next';
import useLessonStore from '@/pages/ClassManagement/LessonPage/useLessonStore';
import { FaArrowRightFromBracket, FaArrowRightToBracket, FaEarthAmericas } from 'react-icons/fa6';
import type LmnUserInfo from '@libs/lmnApi/types/lmnUserInfo';
import { FaFileAlt, FaWifi } from 'react-icons/fa';
import { TbFilterCode } from 'react-icons/tb';
import { FiPrinter } from 'react-icons/fi';
import { IconType } from 'react-icons';
import { PiEyeFill } from 'react-icons/pi';
import useLmnApiStore from '@/store/useLmnApiStore';
import FloatingButtonsBar from '@/components/shared/FloatingsButtonsBar/FloatingButtonsBar';
import ReloadButton from '@/components/shared/FloatingsButtonsBar/CommonButtonConfigs/reloadButton';
import FloatingButtonsBarConfig from '@libs/ui/types/FloatingButtons/floatingButtonsBarConfig';
import useFileSharingDialogStore from '@/pages/FileSharing/Dialog/useFileSharingDialogStore';
import buildShareDTO from '@libs/filesharing/utils/buildShareDTO';
import CLASSMGMT_OPTIONS from '@libs/classManagement/constants/classmgmtOptions';
import getDialogComponent from '@/pages/ClassManagement/LessonPage/getDialogComponent';
import buildCollectDTO from '@libs/filesharing/utils/buildCollectDTO';
import useFileSharingMoveDialogStore from '@/pages/FileSharing/useFileSharingMoveDialogStore';
import VEYON_FEATURE_ACTIONS from '@libs/veyon/constants/veyonFeatureActions';
import getStringFromArray from '@libs/common/utils/getStringFromArray';
import useFileSharingStore from '@/pages/FileSharing/useFileSharingStore';
import useVeyonFeatures from './UserArea/useVeyonFeatures';
import useVeyonApiStore from '../useVeyonApiStore';

interface FloatingButtonsBarProps {
  students: LmnUserInfo[];
  isMemberSelected: boolean;
  isVeyonEnabled: boolean;
  isQuotaExceeded: boolean;
  fetchData: () => Promise<void>;
}

const LessonFloatingButtonsBar: React.FC<FloatingButtonsBarProps> = ({
  students,
  isMemberSelected,
  isVeyonEnabled,
  fetchData,
  isQuotaExceeded,
}) => {
  const [whichDialogIsOpen, setWhichDialogIsOpen] = useState<string>('');
  const {
    startExamMode,
    stopExamMode,
    addManagementGroup,
    removeManagementGroup,
    setMember,
    shareFiles,
    collectFiles,
    member,
    groupNameFromStore,
  } = useLessonStore();
  const { fetchUser, user, schoolPrefix } = useLmnApiStore();
  const { activeCollectionOperation } = useFileSharingMoveDialogStore();
  const { moveOrCopyItemToPath } = useFileSharingDialogStore();
  const { userConnectionUids } = useVeyonApiStore();
  const { handleSetVeyonFeature } = useVeyonFeatures();
  const selectedWebdavShare = useFileSharingStore((s) => s.selectedWebdavShare);

  const updateStudents = async () => {
    const updatedStudents = await Promise.all(students.map((m) => fetchUser(m.cn)));

    setMember(
      [...member.filter((m) => !updatedStudents.find((us) => us?.cn === m.cn)), ...updatedStudents].filter(
        (m): m is LmnUserInfo => !!m,
      ),
    );
  };

  const selectedStudents = students.map((m) => m.cn);
  const connectionUids = students
    .map((student) => userConnectionUids.find((conn) => conn.veyonUsername === student.cn)?.connectionUid)
    .filter((uid): uid is string => Boolean(uid));

  const rawButtons: {
    icon: IconType;
    text: string;
    enableAction: () => Promise<void>;
    disableAction: () => Promise<void>;
    enableText?: string;
    disableText?: string;
  }[] = [
    {
      icon: FaArrowRightFromBracket,
      text: CLASSMGMT_OPTIONS.SHARE,
      enableAction: async () => {
        const shareDTO = buildShareDTO(user?.cn, students, moveOrCopyItemToPath);
        if (!shareDTO) return;
        await shareFiles(shareDTO, selectedWebdavShare);
      },
      disableAction: async () => {},
    },
    {
      icon: FaArrowRightToBracket,
      text: CLASSMGMT_OPTIONS.COLLECT,
      enableAction: async () => {
        const collectDTO = buildCollectDTO(
          students,
          user,
          groupNameFromStore || '',
          getStringFromArray(user?.sophomorixIntrinsic2),
        );
        if (!collectDTO) return;
        await collectFiles(collectDTO, user?.sophomorixRole || '', activeCollectionOperation, selectedWebdavShare);
      },
      disableAction: async () => {},
    },
    {
      icon: FaFileAlt,
      text: CLASSMGMT_OPTIONS.SHOWCOLLECTEDFILES,
      enableAction: async () => {},
      disableAction: async () => {},
    },
    {
      icon: FaWifi,
      text: CLASSMGMT_OPTIONS.WIFI,
      enableAction: async () => {
        await addManagementGroup(`${schoolPrefix}${CLASSMGMT_OPTIONS.WIFI}`, selectedStudents);
      },

      disableAction: async () => {
        await removeManagementGroup(`${schoolPrefix}${CLASSMGMT_OPTIONS.WIFI}`, selectedStudents);
      },
    },
    {
      icon: TbFilterCode,
      text: CLASSMGMT_OPTIONS.WEBFILTER,
      enableAction: async () => {
        await addManagementGroup(`${schoolPrefix}${CLASSMGMT_OPTIONS.WEBFILTER}`, selectedStudents);
      },
      disableAction: async () => {
        await removeManagementGroup(`${schoolPrefix}${CLASSMGMT_OPTIONS.WEBFILTER}`, selectedStudents);
      },
    },
    {
      icon: FaEarthAmericas,
      text: CLASSMGMT_OPTIONS.INTERNET,
      enableAction: async () => {
        await addManagementGroup(`${schoolPrefix}${CLASSMGMT_OPTIONS.INTERNET}`, selectedStudents);
      },
      disableAction: async () => {
        await removeManagementGroup(`${schoolPrefix}${CLASSMGMT_OPTIONS.INTERNET}`, selectedStudents);
      },
    },
    {
      icon: FiPrinter,
      text: CLASSMGMT_OPTIONS.PRINTING,
      enableAction: async () => {
        await addManagementGroup(`${schoolPrefix}${CLASSMGMT_OPTIONS.PRINTING}`, selectedStudents);
      },
      disableAction: async () => {
        await removeManagementGroup(`${schoolPrefix}${CLASSMGMT_OPTIONS.PRINTING}`, selectedStudents);
      },
    },
    {
      icon: MdSchool,
      text: CLASSMGMT_OPTIONS.EXAMMODE,
      enableAction: async () => {
        await startExamMode(selectedStudents);
      },
      disableAction: async () => {
        await stopExamMode(selectedStudents);
      },
      enableText: 'common.start',
      disableText: 'common.stop',
    },
  ];

  const buttons = isQuotaExceeded
    ? rawButtons.filter((button) => button.text !== CLASSMGMT_OPTIONS.COLLECT)
    : rawButtons;

  const config: FloatingButtonsBarConfig = {
    buttons: [
      ReloadButton(() => {
        void fetchData();
      }),
      ...buttons.map((button) => ({
        icon: button.icon,
        text: t(`classmanagement.${button.text}`),
        onClick: () => setWhichDialogIsOpen(button.text),
        isVisible: isMemberSelected,
      })),
      {
        variant: 'dropdown',
        icon: PiEyeFill,
        text: t(`classmanagement.${CLASSMGMT_OPTIONS.VEYON}`),
        isVisible: isMemberSelected && isVeyonEnabled && connectionUids.length > 0,
        dropdownItems: [
          {
            label: t('veyon.lockScreen'),
            onClick: () => handleSetVeyonFeature(connectionUids, VEYON_FEATURE_ACTIONS.SCREENLOCK, true),
          },
          {
            label: t('veyon.unlockScreen'),
            onClick: () => handleSetVeyonFeature(connectionUids, VEYON_FEATURE_ACTIONS.SCREENLOCK, false),
          },
          { label: 'veyonSeparator1', isSeparator: true },
          {
            label: t('veyon.lockInputDevices'),
            onClick: () => handleSetVeyonFeature(connectionUids, VEYON_FEATURE_ACTIONS.INPUT_DEVICES_LOCK, true),
          },
          {
            label: t('veyon.unlockInputDevices'),
            onClick: () => handleSetVeyonFeature(connectionUids, VEYON_FEATURE_ACTIONS.INPUT_DEVICES_LOCK, false),
          },
          { label: 'veyonSeparator2', isSeparator: true },
          {
            label: t('veyon.rebootSystem'),
            onClick: () => handleSetVeyonFeature(connectionUids, VEYON_FEATURE_ACTIONS.REBOOT, true),
          },
          {
            label: t('veyon.powerDown'),
            onClick: () => handleSetVeyonFeature(connectionUids, VEYON_FEATURE_ACTIONS.POWER_DOWN, true),
          },
        ],
      },
    ],
    keyPrefix: 'class-management-page-floating-button_',
  };

  return (
    <>
      <FloatingButtonsBar config={config} />
      {buttons.map((button) => (
        <div key={button.text}>
          {getDialogComponent(button, whichDialogIsOpen, setWhichDialogIsOpen, updateStudents, students)}
        </div>
      ))}
    </>
  );
};

export default LessonFloatingButtonsBar;
