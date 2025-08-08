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

import React from 'react';
import { IconType } from 'react-icons';
import ShareFilesDialog from '@/pages/ClassManagement/components/Dialogs/ShareFilesDialog';
import CLASSMGMT_OPTIONS from '@libs/classManagement/constants/classmgmtOptions';
import LessonConfirmationDialog from '@/pages/ClassManagement/LessonPage/LessonConfirmationDialog';
import type LmnUserInfo from '@libs/lmnApi/types/lmnUserInfo';
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
  students?: LmnUserInfo[],
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
    case CLASSMGMT_OPTIONS.SHARE:
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
    case CLASSMGMT_OPTIONS.COLLECT:
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
    case CLASSMGMT_OPTIONS.SHOWCOLLECTEDFILES:
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
