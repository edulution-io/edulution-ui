import React, { useState } from 'react';
import LmnApiSchoolClass from '@libs/lmnApi/types/lmnApiSchoolClass';
import { FaFileCsv, FaRegFilePdf } from 'react-icons/fa6';
import PrintPasswordsFormat from '@libs/classManagement/types/printPasswordsFormat';
import FloatingButtonsBar from '@/components/shared/FloatingsButtonsBar/FloatingButtonsBar';
import FloatingButtonsBarConfig from '@libs/ui/types/FloatingButtons/floatingButtonsBarConfig';
import { useTranslation } from 'react-i18next';
import PrintPasswordsDialog from './PrintPasswordsDialog';

interface FloatingButtonsBarProps {
  selectedClasses: LmnApiSchoolClass[];
}

const PasswordsFloatingButtonsBar: React.FC<FloatingButtonsBarProps> = ({ selectedClasses }) => {
  const [isDialogOpen, setIsDialogOpen] = useState<PrintPasswordsFormat | null>(null);
  const { t } = useTranslation();

  if (!selectedClasses.length) {
    return null;
  }

  const config: FloatingButtonsBarConfig = {
    buttons: [
      {
        icon: FaRegFilePdf,
        text: t(`classmanagement.${PrintPasswordsFormat.PDF}`),
        onClick: () => setIsDialogOpen(PrintPasswordsFormat.PDF),
      },
      {
        icon: FaFileCsv,
        text: t(`classmanagement.${PrintPasswordsFormat.CSV}`),
        onClick: () => setIsDialogOpen(PrintPasswordsFormat.CSV),
      },
    ],
    keyPrefix: 'class-management-page-floating-button_',
  };

  return (
    <>
      <FloatingButtonsBar config={config} />
      {isDialogOpen ? (
        <PrintPasswordsDialog
          title={isDialogOpen}
          selectedClasses={selectedClasses}
          onClose={() => setIsDialogOpen(null)}
        />
      ) : null}
    </>
  );
};

export default PasswordsFloatingButtonsBar;
