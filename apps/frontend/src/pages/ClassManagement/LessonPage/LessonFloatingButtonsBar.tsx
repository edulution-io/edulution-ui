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
import FloatingButtons from '@libs/lmnApi/types/FloatingButtons';
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
    text: FloatingButtons;
    enableAction: () => Promise<void>;
    disableAction: () => Promise<void>;
    enableText?: string;
    disableText?: string;
  }[] = [
    {
      icon: FaArrowRightFromBracket,
      text: FloatingButtons.Share,
      enableAction: async () => {
        const shareDTO = buildShareDTO(member, moveOrCopyItemToPath);
        if (!shareDTO) return;
        await shareFiles(shareDTO);
      },
      disableAction: async () => {},
    },
    {
      icon: FaArrowRightToBracket,
      text: FloatingButtons.Collect,
      enableAction: async () => {
        const collectDTO = buildCollectDTO(member, user);
        if (!collectDTO) return;
        await collectFiles(collectDTO, user?.sophomorixRole || '');
      },
      disableAction: async () => {
        // eslint-disable-next-line no-alert
        alert(t(`classmanagement.featureIsStillInDevelopment`)); // Will be implemented in NIEDUUI-359
      },
    },
    {
      icon: FaFileAlt,
      text: FloatingButtons.ShowCollectedFiles,
      enableAction: async () => {
        // eslint-disable-next-line no-alert
        alert(t(`classmanagement.featureIsStillInDevelopment`)); // Will be implemented in NIEDUUI-359
      },
      disableAction: async () => {
        // eslint-disable-next-line no-alert
        alert(t(`classmanagement.featureIsStillInDevelopment`)); // Will be implemented in NIEDUUI-359
      },
    },
    {
      icon: FaWifi,
      text: FloatingButtons.Wifi,
      enableAction: async () => {
        await addManagementGroup(
          FloatingButtons.Wifi,
          students.map((m) => m.cn),
        );
      },
      disableAction: async () => {
        await removeManagementGroup(
          FloatingButtons.Wifi,
          students.map((m) => m.cn),
        );
      },
    },
    {
      icon: TbFilterCode,
      text: FloatingButtons.WebFilter,
      enableAction: async () => {
        await addManagementGroup(
          FloatingButtons.WebFilter,
          students.map((m) => m.cn),
        );
      },
      disableAction: async () => {
        await removeManagementGroup(
          FloatingButtons.WebFilter,
          students.map((m) => m.cn),
        );
      },
    },
    {
      icon: FaEarthAmericas,
      text: FloatingButtons.Internet,
      enableAction: async () => {
        await addManagementGroup(
          FloatingButtons.Internet,
          students.map((m) => m.cn),
        );
      },
      disableAction: async () => {
        await removeManagementGroup(
          FloatingButtons.Internet,
          students.map((m) => m.cn),
        );
      },
    },
    {
      icon: FiPrinter,
      text: FloatingButtons.Printing,
      enableAction: async () => {
        await addManagementGroup(
          FloatingButtons.Printing,
          students.map((m) => m.cn),
        );
      },
      disableAction: async () => {
        await removeManagementGroup(
          FloatingButtons.Printing,
          students.map((m) => m.cn),
        );
      },
    },
    {
      icon: MdSchool,
      text: FloatingButtons.ExamMode,
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
