import React, { useState } from 'react';
import { TooltipProvider } from '@/components/ui/Tooltip';
import { t } from 'i18next';
import FloatingActionButton from '@/components/ui/FloatingActionButton';
import { IconType } from 'react-icons';
import LmnApiSchoolClass from '@libs/lmnApi/types/lmnApiSchoolClass';
import PrintPasswordsDialog from '@/pages/ClassManagement/PasswordsPage/PrintPasswordsDialog';
import { FaFileCsv, FaRegFilePdf } from 'react-icons/fa6';
import PrintPasswordsFormat from '@libs/classManagement/types/printPasswordsFormat';

interface FloatingButtonsBarProps {
  selectedClasses: LmnApiSchoolClass[];
}

const PasswordsFloatingButtonsBar: React.FC<FloatingButtonsBarProps> = ({ selectedClasses }) => {
  const [isDialogOpen, setIsDialogOpen] = useState<PrintPasswordsFormat | null>(null);

  if (!selectedClasses.length) {
    return null;
  }

  const buttons: {
    icon: IconType;
    text: PrintPasswordsFormat;
  }[] = [
    {
      icon: FaRegFilePdf,
      text: PrintPasswordsFormat.PDF,
    },
    {
      icon: FaFileCsv,
      text: PrintPasswordsFormat.CSV,
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
              {isDialogOpen === button.text ? (
                <PrintPasswordsDialog
                  title={button.text}
                  selectedClasses={selectedClasses}
                  onClose={() => setIsDialogOpen(null)}
                />
              ) : null}
            </div>
          ))}
        </div>
      </TooltipProvider>
    </div>
  );
};

export default PasswordsFloatingButtonsBar;
