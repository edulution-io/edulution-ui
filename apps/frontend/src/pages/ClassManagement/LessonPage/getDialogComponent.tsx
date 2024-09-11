import React from 'react';
import ShareFilesDialog from '@/pages/ClassManagement/components/Dialogs/ShareFilesDialog';
import FloatingButtons from '@libs/lmnApi/types/FloatingButtons';
import LessonConfirmationDialog from '@/pages/ClassManagement/LessonPage/LessonConfirmationDialog';
import UserLmnInfo from '@libs/lmnApi/types/userInfo';
import { IconType } from 'react-icons';
import CollectedFilesDialog from '@/pages/ClassManagement/components/Dialogs/CollectedFilesDialog';

interface ButtonConfig {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  action?: () => void;
  enableAction: () => void;
  disableAction: () => void;
  enableText?: string;
  disableText?: string;
}

const getDialogComponent = (
  button: {
    icon: IconType;
    text: FloatingButtons;
    enableAction: () => Promise<void>;
    disableAction: () => Promise<void>;
    enableText?: string;
    disableText?: string;
  },
  isDialogOpen: string,
  setIsDialogOpen: (value: string) => void,
  updateStudents: () => Promise<void>,
  students?: UserLmnInfo[],
) => {
  const buttonConfig: ButtonConfig = {
    title: button.text,
    isOpen: isDialogOpen === button.text.toString(),
    onClose: () => setIsDialogOpen(''),
    action: () => {
      void button.enableAction();
      setIsDialogOpen('');
      void updateStudents();
    },
    enableAction: () => {
      void button.enableAction().then(() => {
        setIsDialogOpen('');
        void updateStudents();
      });
    },
    disableAction: () => {
      void button.disableAction().then(() => {
        setIsDialogOpen('');
        void updateStudents();
      });
    },
    enableText: button.enableText,
    disableText: button.disableText,
  };

  switch (button.text) {
    case FloatingButtons.Share:
      if (buttonConfig.action) {
        return (
          <ShareFilesDialog
            title={buttonConfig.title}
            isOpen={buttonConfig.isOpen}
            onClose={buttonConfig.onClose}
            action={buttonConfig.action}
          />
        );
      }
      return null;
    case FloatingButtons.ShowCollectedFiles:
      return (
        <CollectedFilesDialog
          title={buttonConfig.title}
          isOpen={buttonConfig.isOpen}
          onClose={buttonConfig.onClose}
        />
      );
    default:
      return students ? (
        <LessonConfirmationDialog
          title={buttonConfig.title}
          member={students}
          isOpen={buttonConfig.isOpen}
          onClose={buttonConfig.onClose}
          enableAction={buttonConfig.enableAction} // Now synchronous
          disableAction={buttonConfig.disableAction} // Now synchronous
          enableText={buttonConfig.enableText}
          disableText={buttonConfig.disableText}
        />
      ) : null;
  }
};

export default getDialogComponent;
