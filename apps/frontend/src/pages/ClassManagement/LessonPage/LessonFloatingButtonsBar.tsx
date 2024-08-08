/* eslint-disable @typescript-eslint/require-await */
import React, { useState } from 'react';
import { MdSchool } from 'react-icons/md';
import { TooltipProvider } from '@/components/ui/Tooltip';
import { t } from 'i18next';
import FloatingActionButton from '@/components/ui/FloatingActionButton';
import LessonConfirmationDialog from '@/pages/ClassManagement/LessonPage/LessonConfirmationDialog';
import useLessonStore from '@/pages/ClassManagement/LessonPage/useLessonStore';
import { FaArrowRightFromBracket, FaArrowRightToBracket, FaEarthAmericas } from 'react-icons/fa6';
import UserLmnInfo from '@libs/lmnApi/types/userInfo';
import { FaFileAlt, FaWifi } from 'react-icons/fa';
import { TbFilterCode } from 'react-icons/tb';
import { FiPrinter } from 'react-icons/fi';
import { IconType } from 'react-icons';
import useLmnApiStore from '@/store/useLmnApiStore';

interface FloatingButtonsBarProps {
  students: UserLmnInfo[];
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

const LessonFloatingButtonsBar: React.FC<FloatingButtonsBarProps> = ({ students }) => {
  const [isDialogOpen, setIsDialogOpen] = useState<string>('');
  const { startExamMode, stopExamMode, addManagementGroup, removeManagementGroup, setMember, member } =
    useLessonStore();
  const { fetchUser } = useLmnApiStore();

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

  return (
    <div className="fixed bottom-8 flex flex-row space-x-8 bg-opacity-90">
      <TooltipProvider>
        <div className="flex flex-row items-center space-x-8">
          {buttons.map((button) => (
            <div key={button.text}>
              <FloatingActionButton
                icon={button.icon}
                text={t(`classmanagement.${button.text}`)}
                onClick={() => setIsDialogOpen(button.text)}
              />
              <LessonConfirmationDialog
                title={button.text}
                member={students}
                isOpen={isDialogOpen === button.text.toString()}
                onClose={() => setIsDialogOpen('')}
                enableAction={async () => {
                  await button.enableAction();
                  setIsDialogOpen('');
                  await updateStudents();
                }}
                disableAction={async () => {
                  await button.disableAction();
                  setIsDialogOpen('');
                  await updateStudents();
                }}
                enableText={button.enableText}
                disableText={button.disableText}
              />
            </div>
          ))}
        </div>
      </TooltipProvider>
    </div>
  );
};

export default LessonFloatingButtonsBar;
