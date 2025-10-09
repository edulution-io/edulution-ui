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

  const handelConfirm = async () => {
    const school = selectedClasses.length > 0 ? selectedClasses[0].sophomorixSchoolname : DEFAULT_SCHOOL;

    switch (title) {
      case PrintPasswordsFormat.PDF:
        await printPasswords({
          format: PrintPasswordsFormat.PDF,
          school,
          pdflatex: isPdfLatexSelected,
          one_per_page: isOneItemPerPageSelected,
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
        ) : null}
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
