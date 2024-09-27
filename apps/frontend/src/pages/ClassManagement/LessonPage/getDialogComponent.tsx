import React from 'react';
import { IconType } from 'react-icons';
import ShareFilesDialog from '@/pages/ClassManagement/components/Dialogs/ShareFilesDialog';
import ClassMgmtFloatingButtons from '@libs/classManagement/constants/floatingButtons';
import LessonConfirmationDialog from '@/pages/ClassManagement/LessonPage/LessonConfirmationDialog';
import type UserLmnInfo from '@libs/lmnApi/types/userInfo';
import type ClassmanagementButtonConfigProps from '@libs/classManagement/types/classmanagementButtonConfigProps';
import ShowCollectedFilesDialog from '../components/Dialogs/ShowCollectedFilesDialog';
import CollectFilesDialog from '../components/Dialogs/CollectFilesDialog';

type ButtonType = Pick<
  ClassmanagementButtonConfigProps,
  'enableAction' | 'disableAction' | 'enableText' | 'disableText'
> & {
  icon: IconType;
  text: string;
};

const getDialogComponent = (
  button: ButtonType,
  whichDialogIsOpen: string,
  setWhichDialogIsOpen: (value: string) => void,
  updateStudents: () => Promise<void>,
  students?: UserLmnInfo[],
) => {
  const buttonConfig: ClassmanagementButtonConfigProps = {
    title: button.text,
    isOpen: whichDialogIsOpen === button.text,
    onClose: () => setWhichDialogIsOpen(''),
    action: async () => {
      await button.enableAction();
      setWhichDialogIsOpen('');
      await updateStudents();
    },
    enableAction: async () => {
      await button.enableAction().then(async () => {
        setWhichDialogIsOpen('');
        await updateStudents();
      });
    },
    disableAction: async () => {
      await button.disableAction().then(async () => {
        setWhichDialogIsOpen('');
        await updateStudents();
      });
    },
    enableText: button.enableText,
    disableText: button.disableText,
  };

  switch (button.text) {
    case ClassMgmtFloatingButtons.Share:
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
    case ClassMgmtFloatingButtons.Collect:
      if (buttonConfig.action) {
        return (
          <CollectFilesDialog
            title={buttonConfig.title}
            isOpen={buttonConfig.isOpen}
            onClose={buttonConfig.onClose}
            action={buttonConfig.action}
          />
        );
      }
      return null;
    case ClassMgmtFloatingButtons.ShowCollectedFiles:
      return (
        <ShowCollectedFilesDialog
          title={buttonConfig.title}
          isOpen={buttonConfig.isOpen}
          onClose={buttonConfig.onClose}
          action={() => buttonConfig.action}
        />
      );
    default:
      return students ? (
        <LessonConfirmationDialog
          title={buttonConfig.title}
          member={students}
          isOpen={buttonConfig.isOpen}
          onClose={buttonConfig.onClose}
          enableAction={buttonConfig.enableAction}
          disableAction={buttonConfig.disableAction}
          enableText={buttonConfig.enableText}
          disableText={buttonConfig.disableText}
        />
      ) : null;
  }
};

export default getDialogComponent;
