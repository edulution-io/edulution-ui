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
import UserLmnInfo from '@libs/lmnApi/types/userInfo';
import { FaFileAlt, FaWifi } from 'react-icons/fa';
import { TbFilterCode } from 'react-icons/tb';
import { FiPrinter } from 'react-icons/fi';
import { IconType } from 'react-icons';
import useLmnApiStore from '@/store/useLmnApiStore';
import FloatingButtonsBar from '@/components/shared/FloatingsButtonsBar/FloatingButtonsBar';
import FloatingButtonsBarConfig from '@libs/ui/types/FloatingButtons/floatingButtonsBarConfig';
import useFileSharingDialogStore from '@/pages/FileSharing/dialog/useFileSharingDialogStore';
import buildShareDTO from '@libs/filesharing/utils/buildShareDTO';
import CLASSMGMT_OPTIONS from '@libs/classManagement/constants/classmgmtOptions';
import getDialogComponent from '@/pages/ClassManagement/LessonPage/getDialogComponent';
import buildCollectDTO from '@libs/filesharing/utils/buildCollectDTO';

interface FloatingButtonsBarProps {
  students: UserLmnInfo[];
}

const LessonFloatingButtonsBar: React.FC<FloatingButtonsBarProps> = ({ students }) => {
  const [whichDialogIsOpen, setWhichDialogIsOpen] = useState<string>('');
  const {
    startExamMode,
    stopExamMode,
    addManagementGroup,
    removeManagementGroup,
    setMember,
    shareFiles,
    collectFiles,
    collectionType,
    member,
    groupNameFromStore,
  } = useLessonStore();
  const { fetchUser, user, schoolPrefix } = useLmnApiStore();
  const { moveOrCopyItemToPath } = useFileSharingDialogStore();
  const updateStudents = async () => {
    const updatedStudents = await Promise.all(students.map((m) => fetchUser(m.cn)));

    setMember(
      [...member.filter((m) => !updatedStudents.find((us) => us?.cn === m.cn)), ...updatedStudents].filter(
        (m): m is UserLmnInfo => !!m,
      ),
    );
  };

  const buttons: {
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
        await shareFiles(shareDTO);
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
          user?.sophomorixIntrinsic2[0] || '',
        );
        if (!collectDTO) return;
        await collectFiles(collectDTO, user?.sophomorixRole || '', collectionType);
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
        await addManagementGroup(
          `${schoolPrefix}${CLASSMGMT_OPTIONS.WIFI}`,
          students.map((m) => m.cn),
        );
      },

      disableAction: async () => {
        await removeManagementGroup(
          `${schoolPrefix}${CLASSMGMT_OPTIONS.WIFI}`,
          students.map((m) => m.cn),
        );
      },
    },
    {
      icon: TbFilterCode,
      text: CLASSMGMT_OPTIONS.WEBFILTER,
      enableAction: async () => {
        await addManagementGroup(
          `${schoolPrefix}${CLASSMGMT_OPTIONS.WEBFILTER}`,
          students.map((m) => m.cn),
        );
      },
      disableAction: async () => {
        await removeManagementGroup(
          `${schoolPrefix}${CLASSMGMT_OPTIONS.WEBFILTER}`,
          students.map((m) => m.cn),
        );
      },
    },
    {
      icon: FaEarthAmericas,
      text: CLASSMGMT_OPTIONS.INTERNET,
      enableAction: async () => {
        await addManagementGroup(
          `${schoolPrefix}${CLASSMGMT_OPTIONS.INTERNET}`,
          students.map((m) => m.cn),
        );
      },
      disableAction: async () => {
        await removeManagementGroup(
          `${schoolPrefix}${CLASSMGMT_OPTIONS.INTERNET}`,
          students.map((m) => m.cn),
        );
      },
    },
    {
      icon: FiPrinter,
      text: CLASSMGMT_OPTIONS.PRINTING,
      enableAction: async () => {
        await addManagementGroup(
          `${schoolPrefix}${CLASSMGMT_OPTIONS.PRINTING}`,
          students.map((m) => m.cn),
        );
      },
      disableAction: async () => {
        await removeManagementGroup(
          `${schoolPrefix}${CLASSMGMT_OPTIONS.PRINTING}`,
          students.map((m) => m.cn),
        );
      },
    },
    {
      icon: MdSchool,
      text: CLASSMGMT_OPTIONS.EXAMMODE,
      enableAction: async () => {
        await startExamMode(students.map((m) => m.cn));
      },
      disableAction: async () => {
        await stopExamMode(students.map((m) => m.cn));
      },
      enableText: 'common.start',
      disableText: 'common.stop',
    },
  ];

  const config: FloatingButtonsBarConfig = {
    buttons: buttons.map((button) => ({
      icon: button.icon,
      text: t(`classmanagement.${button.text}`),
      onClick: () => setWhichDialogIsOpen(button.text),
    })),
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
