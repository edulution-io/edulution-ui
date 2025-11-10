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
