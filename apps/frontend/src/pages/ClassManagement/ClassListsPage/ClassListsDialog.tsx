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
import { t } from 'i18next';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import LmnApiSchoolClass from '@libs/lmnApi/types/lmnApiSchoolClass';
import type FileExportFormat from '@libs/classManagement/types/fileExportFormat';
import CircleLoader from '@/components/ui/Loading/CircleLoader';
import DialogFooterButtons from '@/components/ui/DialogFooterButtons';
import useClassListsStore from './useClassListsStore';

interface ClassListsDialogProps {
  title: FileExportFormat;
  selectedClasses: LmnApiSchoolClass[];
  onClose: () => void;
}

const ClassListsDialog: React.FC<ClassListsDialogProps> = ({ selectedClasses, title, onClose }) => {
  const { downloadStudentsList, downloadStudentsLists, isLoading } = useClassListsStore();

  const handleConfirm = async () => {
    if (selectedClasses.length === 1) {
      await downloadStudentsList(selectedClasses[0].cn, title);
    } else {
      await downloadStudentsLists(selectedClasses, title);
    }
    onClose();
  };

  const getDialogBody = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center">
          <CircleLoader />
        </div>
      );
    }

    return (
      <div className="text-background">
        <p>{t(`classmanagement.${title}StudentsListDescription`)}:</p>
        <p className="ml-2 mt-2">{selectedClasses.map((m) => m.displayName || m.cn).join(', ')}</p>
      </div>
    );
  };

  const getFooter = () => {
    if (isLoading) {
      return null;
    }

    return (
      <DialogFooterButtons
        handleClose={onClose}
        handleSubmit={handleConfirm}
        submitButtonText="downloadFile"
      />
    );
  };

  const dialogTitle = `${t(`classmanagement.${title}`)} ${t('classmanagement.createFile')}`;

  return (
    <AdaptiveDialog
      isOpen
      handleOpenChange={onClose}
      title={dialogTitle}
      body={getDialogBody()}
      footer={getFooter()}
    />
  );
};

export default ClassListsDialog;
