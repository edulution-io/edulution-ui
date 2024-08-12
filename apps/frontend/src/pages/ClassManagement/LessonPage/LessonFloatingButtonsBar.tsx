/* eslint-disable @typescript-eslint/require-await */
import React, { useState } from 'react';
import { MdSchool } from 'react-icons/md';
import { t } from 'i18next';
import LessonConfirmationDialog from '@/pages/ClassManagement/LessonPage/LessonConfirmationDialog';
import useLessonStore from '@/pages/ClassManagement/LessonPage/useLessonStore';
import { FaArrowRightFromBracket, FaArrowRightToBracket, FaEarthAmericas } from 'react-icons/fa6';
import UserLmnInfo from '@libs/lmnApi/types/userInfo';
import { FaFileAlt, FaWifi } from 'react-icons/fa';
import { TbFilterCode } from 'react-icons/tb';
import { FiPrinter } from 'react-icons/fi';
import { IconType } from 'react-icons';
import FloatingButtonsBar from '@/components/shared/FloatingsButtonsBar/FloatingButtonsBar';
import FloatingButtonsBarConfig from '@libs/ui/types/FloatingButtons/floatingButtonsBarConfig';

interface FloatingButtonsBarProps {
  member: UserLmnInfo[];
  fetchData: () => Promise<void>;
}

enum FloatingButtons {
  Share = 'share',
  Collect = 'collect',
  ShowCollectedFiles = 'showCollectedFiles',
  Wifi = 'wifi',
  WebFilter = 'webfilter',
  Internet = 'internet',
  Printing = 'printing',
  ExamMode = 'exam',
}

const LessonFloatingButtonsBar: React.FC<FloatingButtonsBarProps> = ({ member, fetchData }) => {
  const [isDialogOpen, setIsDialogOpen] = useState<string>('');
  const { startExamMode, stopExamMode, addManagementGroup, removeManagementGroup } = useLessonStore();

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
        // eslint-disable-next-line no-alert
        alert(t(`classmanagement.featureIsStillInDevelopment`)); // Will be implemented in NIEDUUI-359
      },
      disableAction: async () => {
        // eslint-disable-next-line no-alert
        alert(t(`classmanagement.featureIsStillInDevelopment`)); // Will be implemented in NIEDUUI-359
      },
    },
    {
      icon: FaArrowRightToBracket,
      text: FloatingButtons.Collect,
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
          member.map((m) => m.cn),
        );
      },
      disableAction: async () => {
        await removeManagementGroup(
          FloatingButtons.Wifi,
          member.map((m) => m.cn),
        );
      },
    },
    {
      icon: TbFilterCode,
      text: FloatingButtons.WebFilter,
      enableAction: async () => {
        await addManagementGroup(
          FloatingButtons.WebFilter,
          member.map((m) => m.cn),
        );
      },
      disableAction: async () => {
        await removeManagementGroup(
          FloatingButtons.WebFilter,
          member.map((m) => m.cn),
        );
      },
    },
    {
      icon: FaEarthAmericas,
      text: FloatingButtons.Internet,
      enableAction: async () => {
        await addManagementGroup(
          FloatingButtons.Internet,
          member.map((m) => m.cn),
        );
      },
      disableAction: async () => {
        await removeManagementGroup(
          FloatingButtons.Internet,
          member.map((m) => m.cn),
        );
      },
    },
    {
      icon: FiPrinter,
      text: FloatingButtons.Printing,
      enableAction: async () => {
        await addManagementGroup(
          FloatingButtons.Printing,
          member.map((m) => m.cn),
        );
      },
      disableAction: async () => {
        await removeManagementGroup(
          FloatingButtons.Printing,
          member.map((m) => m.cn),
        );
      },
    },
    {
      icon: MdSchool,
      text: FloatingButtons.ExamMode,
      enableAction: async () => {
        await startExamMode(member.map((m) => m.cn));
      },
      disableAction: async () => {
        await stopExamMode(member.map((m) => m.cn));
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
          <LessonConfirmationDialog
            title={button.text}
            member={member}
            isOpen={isDialogOpen === button.text.toString()}
            onClose={() => setIsDialogOpen('')}
            enableAction={async () => {
              await button.enableAction();
              await fetchData();
              setIsDialogOpen('');
            }}
            disableAction={async () => {
              await button.disableAction();
              await fetchData();
              setIsDialogOpen('');
            }}
            enableText={button.enableText}
            disableText={button.disableText}
          />
        </div>
      ))}
    </>
  );
};

export default LessonFloatingButtonsBar;
