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

import React, { useState } from 'react';
import { t } from 'i18next';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import LmnApiSchoolClass from '@libs/lmnApi/types/lmnApiSchoolClass';
import PrintPasswordsFormat from '@libs/classManagement/types/printPasswordsFormat';
import Checkbox from '@/components/ui/Checkbox';
import DEFAULT_SCHOOL from '@libs/lmnApi/constants/defaultSchool';
import usePrintPasswordsStore from '@/pages/ClassManagement/PasswordsPage/usePrintPasswordsStore';
import CircleLoader from '@/components/ui/Loading/CircleLoader';
import DialogFooterButtons from '@/components/ui/DialogFooterButtons';

interface PrintPasswordsDialogProps {
  title: PrintPasswordsFormat;
  selectedClasses: LmnApiSchoolClass[];
  onClose: () => void;
}

const PrintPasswordsDialog: React.FC<PrintPasswordsDialogProps> = ({ selectedClasses, title, onClose }) => {
  const { printPasswords, isLoading } = usePrintPasswordsStore();
  const [isPdfLatexSelected, setIsPdfLatexSelected] = useState<boolean>(false);
  const [isOneItemPerPageSelected, setIsOneItemPerPageSelected] = useState<boolean>(false);
  const [shouldSplitNamesInCsv, setShouldSplitNamesInCsv] = useState<boolean>(false);

  const handelConfirm = async () => {
    const school = selectedClasses.length > 0 ? selectedClasses[0].sophomorixSchoolname : DEFAULT_SCHOOL;

    switch (title) {
      case PrintPasswordsFormat.PDF:
        await printPasswords({
          format: PrintPasswordsFormat.PDF,
          school,
          pdflatex: isPdfLatexSelected,
          one_per_page: isOneItemPerPageSelected,
          nosplit_names: shouldSplitNamesInCsv,
          schoolclasses: selectedClasses.map((m) => m.cn),
        });
        break;
      case PrintPasswordsFormat.CSV:
      default:
        await printPasswords({
          format: PrintPasswordsFormat.CSV,
          school,
          pdflatex: false,
          one_per_page: false,
          nosplit_names: shouldSplitNamesInCsv,
          schoolclasses: selectedClasses.map((m) => m.cn),
        });
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
        <p>{t(`classmanagement.${title}Description`)}:</p>
        <p className="ml-2 mt-2">{selectedClasses.map((m) => m.displayName || m.cn).join(', ')}</p>
        {title === PrintPasswordsFormat.PDF ? (
          <>
            <p className="mb-1.5 mt-3 text-lg">{t('options')}</p>
            <div className="flew-row flex">
              <Checkbox
                className="ml-2 rounded-lg"
                checked={isPdfLatexSelected}
                onCheckedChange={(checked) => setIsPdfLatexSelected(!!checked)}
                aria-label={t('classmanagement.usePdfLatexInsteadOfLatex')}
                label={t('classmanagement.usePdfLatexInsteadOfLatex')}
              />
            </div>
            <div className="flew-row mt-1 flex">
              <Checkbox
                className="ml-2 rounded-lg"
                checked={isOneItemPerPageSelected}
                onCheckedChange={(checked) => setIsOneItemPerPageSelected(!!checked)}
                aria-label={t('classmanagement.printOneItemPerPage')}
                label={t('classmanagement.printOneItemPerPage')}
              />
            </div>
          </>
        ) : (
          <>
            <p className="mb-1.5 mt-3 text-lg">{t('options')}</p>
            <div className="flew-row mt-1 flex">
              <Checkbox
                className="ml-2 rounded-lg"
                checked={shouldSplitNamesInCsv}
                onCheckedChange={(checked) => setShouldSplitNamesInCsv(!!checked)}
                aria-label={t('classmanagement.shouldSplitNamesInCsv')}
                label={t('classmanagement.shouldSplitNamesInCsv')}
              />
            </div>
          </>
        )}
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
        handleSubmit={handelConfirm}
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

export default PrintPasswordsDialog;
