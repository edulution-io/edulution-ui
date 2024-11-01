import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import { t } from 'i18next';
import React, { useState } from 'react';
import ShareCollectDialogProps from '@libs/classManagement/types/shareCollectDialogProps';
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSH,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenuSH';
import { Button } from '@/components/shared/Button';
import { FaCopy, FaCut } from 'react-icons/fa';
import { ChevronRightIcon } from '@radix-ui/react-icons';
import useLessonStore from '@/pages/ClassManagement/LessonPage/useLessonStore';
import { LMN_API_COLLECT_OPERATIONS } from '@libs/lmnApi/types/lmnApiCollectOperations';
import { LAYOUT_OPTIONS } from '@libs/ui/constants/layout';

const CollectFilesDialog: React.FC<ShareCollectDialogProps> = ({ title, isOpen, onClose, action }) => {
  const { setCollectionType } = useLessonStore();

  const options = [
    {
      id: '1',
      label: t('classmanagement.collectAndCut'),
      icon: <FaCut />,
      action: () => setCollectionType(LMN_API_COLLECT_OPERATIONS.CUT),
    },
    {
      id: '2',
      label: t('classmanagement.collectAndCopy'),
      icon: <FaCopy />,
      action: () => setCollectionType(LMN_API_COLLECT_OPERATIONS.COPY),
    },
  ];

  const [selectedOption, setSelectedOption] = useState(options[0]);

  React.useEffect(() => {
    selectedOption.action();
  }, [selectedOption]);

  const getDialogBody = () => (
    <div className="w-full items-center ">{t('classmanagement.CollectFilesDescription')}</div>
  );

  const getFooter = () => (
    <div className="h-[120px] justify-between py-2">
      <div className="flex flex-col items-center justify-start">
        <DropdownMenuSH>
          <DropdownMenuLabel>{t('classmanagement.copyOrCut')}</DropdownMenuLabel>
          <div className="flex flex-row items-center">
            <DropdownMenuTrigger
              selectedOptionIcon={selectedOption.icon}
              selectedOptionLabel={selectedOption.label}
            />
            <ChevronRightIcon />
          </div>
          <DropdownMenuContent className="z-100">
            {options.map((option) => (
              <DropdownMenuItem
                key={option.id}
                icon={option.icon}
                onClick={() => setSelectedOption(option)}
              >
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenuSH>
      </div>

      <div className="absolute bottom-0 left-0 right-0 flex justify-end p-4">
        <Button
          type="button"
          size="lg"
          variant="btn-collaboration"
          onClick={action}
        >
          {t(`classmanagement.${title}`)}
        </Button>
      </div>
    </div>
  );

  return (
    <AdaptiveDialog
      isOpen={isOpen}
      handleOpenChange={onClose}
      title={t(`classmanagement.${title}`)}
      body={getDialogBody()}
      footer={getFooter()}
      layout={LAYOUT_OPTIONS.TWO_COLUMN}
    />
  );
};

export default CollectFilesDialog;
