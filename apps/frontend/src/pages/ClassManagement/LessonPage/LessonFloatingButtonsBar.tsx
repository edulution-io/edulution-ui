/* eslint-disable @typescript-eslint/require-await */
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
import ClassMgmtFloatingButtons from '@libs/classManagement/constants/floatingButtons';
import getDialogComponent from '@/pages/ClassManagement/LessonPage/getDialogComponent';
import buildCollectDTO from '@libs/filesharing/utils/buildCollectDTO';

interface FloatingButtonsBarProps {
  students: UserLmnInfo[];
}

const LessonFloatingButtonsBar: React.FC<FloatingButtonsBarProps> = ({ students }) => {
  const [isDialogOpen, setIsDialogOpen] = useState<string>('');
  const {
    startExamMode,
    stopExamMode,
    addManagementGroup,
    removeManagementGroup,
    setMember,
    shareFiles,
    collectFiles,
    member,
    currentGroupName,
  } = useLessonStore();
  const { fetchUser, user } = useLmnApiStore();
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
      text: ClassMgmtFloatingButtons.Share,
      enableAction: async () => {
        const shareDTO = buildShareDTO(member, moveOrCopyItemToPath);
        if (!shareDTO) return;
        await shareFiles(shareDTO);
      },
      disableAction: async () => {},
    },
    {
      icon: FaArrowRightToBracket,
      text: ClassMgmtFloatingButtons.Collect,
      enableAction: async () => {
        const collectDTO = buildCollectDTO(member, user, currentGroupName || '');
        if (!collectDTO) return;
        await collectFiles(collectDTO, user?.sophomorixRole || '');
      },
      disableAction: async () => {},
    },
    {
      icon: FaFileAlt,
      text: ClassMgmtFloatingButtons.ShowCollectedFiles,
      enableAction: async () => {},
      disableAction: async () => {},
    },
    {
      icon: FaWifi,
      text: ClassMgmtFloatingButtons.Wifi,
      enableAction: async () => {
        await addManagementGroup(
          ClassMgmtFloatingButtons.Wifi,
          students.map((m) => m.cn),
        );
      },
      disableAction: async () => {
        await removeManagementGroup(
          ClassMgmtFloatingButtons.Wifi,
          students.map((m) => m.cn),
        );
      },
    },
    {
      icon: TbFilterCode,
      text: ClassMgmtFloatingButtons.WebFilter,
      enableAction: async () => {
        await addManagementGroup(
          ClassMgmtFloatingButtons.WebFilter,
          students.map((m) => m.cn),
        );
      },
      disableAction: async () => {
        await removeManagementGroup(
          ClassMgmtFloatingButtons.WebFilter,
          students.map((m) => m.cn),
        );
      },
    },
    {
      icon: FaEarthAmericas,
      text: ClassMgmtFloatingButtons.Internet,
      enableAction: async () => {
        await addManagementGroup(
          ClassMgmtFloatingButtons.Internet,
          students.map((m) => m.cn),
        );
      },
      disableAction: async () => {
        await removeManagementGroup(
          ClassMgmtFloatingButtons.Internet,
          students.map((m) => m.cn),
        );
      },
    },
    {
      icon: FiPrinter,
      text: ClassMgmtFloatingButtons.Printing,
      enableAction: async () => {
        await addManagementGroup(
          ClassMgmtFloatingButtons.Printing,
          students.map((m) => m.cn),
        );
      },
      disableAction: async () => {
        await removeManagementGroup(
          ClassMgmtFloatingButtons.Printing,
          students.map((m) => m.cn),
        );
      },
    },
    {
      icon: MdSchool,
      text: ClassMgmtFloatingButtons.ExamMode,
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
      onClick: () => setIsDialogOpen(button.text),
    })),
    keyPrefix: 'class-management-page-floating-button_',
  };

  return (
    <>
      <FloatingButtonsBar config={config} />
      {buttons.map((button) => (
        <div key={button.text}>
          {getDialogComponent(button, isDialogOpen, setIsDialogOpen, updateStudents, students)}
        </div>
      ))}
    </>
  );
};

export default LessonFloatingButtonsBar;
